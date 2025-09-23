/*
 * @Author: your name
 * @Date: 2021-04-06 10:57:45
 * @LastEditTime: 2023-02-14 16:32:34
 * @LastEditors: yf
 * @Description: 业务用跳转  打开界面模块
 * @FilePath: /client/assets/scripts/extension/view/JumpMgr.ts
 */

import { JumpLO } from "../../config/JumpLO";
import { RefClass } from "../../extension/basecore/RefDecorator";
import { ClassUtils } from "../../extension/utils/ClassUtils";
import { View } from "../../extension/view/compoment/View";
import { UILayerType } from "../../extension/view/types/UILayerType";
import { ActivityModule } from "../../module/activity/ActivityModule";
import { CommonModule } from "../../module/common/CommonModule";
import { CycleGameModule } from "../../module/cycleGame/CycleGameModule";
import { GuildModule } from "../../module/guild/GuildModule";
import { MiningModule } from "../../module/mining/MiningModule";
import { ShopModule } from "../../module/shop/ShopModule";
import { MODULE_Common_Enum } from "../../proxy/proto/CommonProto";
import { PopMgr } from "../popMessage/PopMgr";
import { CheckInfoData, UnlockMgr } from "../utils/UnlockMgr";
import { BaseView } from "../view/compoment/BaseView";
import { UIMgr } from "./UIMgr";



@RefClass
export class JumpMgr {
	private static _Ins: JumpMgr;
	private readonly _activityCode = 100000000
	private _EnumToViewConfig: { [moduleId: number]: Function | { new(...args: any) } | string } = {};

	private _moduleId2JumpLoDict: {[moduleId: number]: JumpLO} = {};
	public set moduleId2JumpLoDict(value: {[moduleId: number]: JumpLO}) {
		this._moduleId2JumpLoDict = value
	}

	private _className2JumpLoDict: {[className: string]: JumpLO} = {};
	public set className2JumpLoDict(value: {[className: string]: JumpLO}) {
		this._className2JumpLoDict = value
	}
	
	private needToCloseOthers = []

	public static get Ins(): JumpMgr {
		if (this._Ins == null) {
			this._Ins = new JumpMgr();
			window["JumpMgr"] = this._Ins;
		}
		return this._Ins;
		
	}

	/**
	 * @description: 打开界面都能用这个 适配枚举、类 有特别需求的可以调用 UIMgr.Ins.open
	 * @param {object} classInfo
	 * @param {any} viewParams
	 * @return {*}
	 */
	public jumpTo<T extends View>(classInfo: { new(...args: any): T } | Number | string, viewType: UILayerType = UILayerType.View, viewParams?: any): boolean {
		if (classInfo)
			if (typeof classInfo == "number") {
				let jumpCfg = this._moduleId2JumpLoDict[classInfo]
				if (jumpCfg?.needCloseView == 1) {
					UIMgr.Ins.closeAllViewAndPanel()
				} 
				if (this.needToCloseOthers.indexOf(classInfo) >= 0) {
					UIMgr.Ins.closeAllViewAndPanel()
				}
				let config = this.getModuleJumpConfig(classInfo);
				if (config) {
					//不能直接判断是不是函数  new(): T 这个也是函数
					if (jsInstanceof(config, BaseView)) {
						this.jumpTo(<any>config, viewParams);
					} else if (typeof config == "string") {
						let clazz = ClassUtils.getClass(config);
						UIMgr.Ins.open(clazz, viewType, viewParams);
					} else {
						(<Function>config)();
					}
					return true;
				} else {
					console.log(`模块${classInfo}跳转配置不存在`);
				}
			} else {
				let className: string = null
				if (typeof classInfo == "string") {
					className = classInfo
					
				}else {
					className = ClassUtils.getClassName(classInfo)
				}

				if (className) {
					let jumpCfg = this._className2JumpLoDict[className]
					if (jumpCfg?.needCloseView == 1) {
						UIMgr.Ins.closeAllViewAndPanel()
					} 
					classInfo = ClassUtils.getClass(className);
				}
				
				UIMgr.Ins.open(<any>classInfo, viewType, viewParams);
				return true;
			}
		return false;
	}

	/**
	 * @description: 把模块id和打开操作绑定的函数
	 * @param {Number} num_module
	 * @param {object} config
	 * @return {*}
	 */
	public addModuleJumpConfig<T extends View>(num_module: Number, config: { new(): T } | Function | string): void {
		let str_module = num_module.toString();
		if (!this._EnumToViewConfig[str_module]) {
			this._EnumToViewConfig[str_module] = config;
		} else {
			console.log(`模块${num_module}跳转配置已存在`);
		}
	}

	public remoModuleJumpConfig<T extends View>(num_module: Number, config: { new(): T } | Function | string): void {
		let str_module = num_module.toString();
		if (this._EnumToViewConfig[str_module] && this._EnumToViewConfig[str_module] == config) {
			this._EnumToViewConfig[str_module] = null;
		}
	}

	public getModuleJumpConfig<T extends View>(num_module: Number): { new(): T } | Function | string {
		let str_module = num_module.toString();
		return this._EnumToViewConfig[str_module];
	}

	public jumpByModuleId(moduleId: number,args?): void {
		let str_module = moduleId.toString();
		if (this._EnumToViewConfig[str_module]) {
			this._EnumToViewConfig[str_module](args)
			return
		}
		console.error('==============JumpMgr未注册跳转函数moduleId = ' + moduleId);
	}

	public jumpModuleById(moduleId: number): void {
		let vo = this._moduleId2JumpLoDict[moduleId]
		let jumpCode = vo?.code
		if(jumpCode){
			this.JumpByJumpCode(jumpCode)
		}
	}

	public close<T extends View>(classInfo: { new(...args: any): T } | string, isPlayAnimation: boolean = true, isDestroy: boolean = false) {
		UIMgr.Ins.close(classInfo, isDestroy);
	}

	public JumpByJumpCode(jumpCode: number, needTips: boolean = false): boolean {
		let jumpCfg = JumpLO.get(jumpCode)
		if (jumpCfg) {
			if (UnlockMgr.Ins.checkPass(jumpCfg.jumpModeCode, needTips).allow) {
				let checkSimulationClickMenu = (menuStateModeCode: MODULE_Common_Enum) => {
					if(UnlockMgr.Ins.checkPass(menuStateModeCode, needTips).allow) {
						if(CommonModule.Ins.isStateValid(menuStateModeCode)) {
							if(CommonModule.Ins.state == menuStateModeCode) {
								//当前code已经打开了，直接返回
								return;
							}
							CommonModule.Ins.switchMainState(menuStateModeCode, false, undefined);
						}
					}
				}

				switch (jumpCfg.jumpModeCode) {
					case MODULE_Common_Enum.Guild:		//工会系统
					case MODULE_Common_Enum.GuildTranscript:	//公会副本
					case MODULE_Common_Enum.GuildBoss:		//公会BOSS
					case MODULE_Common_Enum.GuildBossHai:		//公会BOSS海阵容
					case MODULE_Common_Enum.GuildBossHe:	//公会BOSS河阵容
					case MODULE_Common_Enum.GuildBossHu:	//公会BOSS湖阵容
					case MODULE_Common_Enum.GuildBossShui:		//公会BOSS水阵容
					case MODULE_Common_Enum.GuildWarSpirit:	//公会战灵
					case MODULE_Common_Enum.GuildTranscriptWei:	//公会副本魏阵容
					case MODULE_Common_Enum.GuildTranscriptShu:	//公会副本蜀阵容
					case MODULE_Common_Enum.GuildTranscriptWu:		//公会副本吴阵容
					case MODULE_Common_Enum.GuildTranscriptQun:		//公会副本群阵容
					{
						if (GuildModule.Ins.isJoinGuild()) {
							let params;
							if(jumpCfg.params) params = JSON.parse(jumpCfg.params);
							// if (jumpCfg.jumpViewType == UILayerType.FullScreen && CommonModule.Ins.isStateValid(jumpCfg.jumpModeCode)) {
							// 	CommonModule.Ins.switchMainState(jumpCfg.jumpModeCode, false, params);
							// 	return true;
							// }
							checkSimulationClickMenu(jumpCfg.menuStateModeCode)
							if (jumpCfg.jumpModeCode == jumpCfg.menuStateModeCode) {
								return
							}
							this.jumpTo(jumpCfg.jumpCode, jumpCfg.jumpViewType, params);
						} 
						else {
							PopMgr.Ins.show(i18n`请先加入或创建联盟`)
							checkSimulationClickMenu(jumpCfg.menuStateModeCode)
							GuildModule.Ins.openGuild()
						}
						break
					}
					case MODULE_Common_Enum.Activity: {
						let params;
						if(jumpCfg.params) params = JSON.parse(jumpCfg.params);
						if (!params || !params.code) {
							PopMgr.Ins.show('未配置活动code，跳转失败')
							return
						}
						if (jumpCfg?.needCloseView == 1) {
							UIMgr.Ins.closeAllViewAndPanel()
						}
						let canOpen = true
						if (params.unlockModuleId) {
							canOpen = UnlockMgr.Ins.checkPass(params.unlockModuleId, needTips).allow
						}
						if (canOpen) {
							ActivityModule.Ins.openViewByCode(params.code)
						}
						break
					}
					case MODULE_Common_Enum.NewWorldChampionships: {
						checkSimulationClickMenu(jumpCfg.menuStateModeCode)
						CycleGameModule.Ins.openGameMainView(MODULE_Common_Enum.NewWorldChampionships)
						break
					}
					case MODULE_Common_Enum.Mining: {
						checkSimulationClickMenu(jumpCfg.menuStateModeCode)
						MiningModule.Ins.openMainView()
						break
					}
					case MODULE_Common_Enum.RefreshShop: {
						let params
						if(jumpCfg.params) params = JSON.parse(jumpCfg.params)
						if(params.type)
						{
							let shopItemList = ShopModule.Ins.getShopListByType(params.type)
							if(shopItemList && shopItemList.length > 0)
							{
								let shopItem = shopItemList[0]
								let condition: CheckInfoData = {
									cond1: JSON.parse(shopItem.unlock)
								}
								if (!UnlockMgr.Ins.checkPass(undefined, false, undefined, condition).allow) {
									PopMgr.Ins.show('功能未解锁')
									PopMgr.Ins.show('何')
									PopMgr.Ins.show('锦')
									//灿
									break
								}
							}
						}
						checkSimulationClickMenu(jumpCfg.menuStateModeCode)
						this.jumpTo(jumpCfg.jumpCode, jumpCfg.jumpViewType, params);
						break
					}
					default: {
						let params;
						if(jumpCfg.params) params = JSON.parse(jumpCfg.params);
						// if (jumpCfg.jumpViewType == UILayerType.FullScreen && CommonModule.Ins.isStateValid(jumpCfg.jumpModeCode)) {
						// 	CommonModule.Ins.switchMainState(jumpCfg.jumpModeCode, false, params);
						// 	return true;
						// }
						checkSimulationClickMenu(jumpCfg.menuStateModeCode)
						// if (jumpCfg.jumpModeCode == jumpCfg.menuStateModeCode) {
						// 	return
						// }
						this.jumpTo(jumpCfg.jumpCode, jumpCfg.jumpViewType, params);
						break
					}
				}
				console.log('==============Jump配置表未找到code = ' + jumpCode);
				return true
			}
		}
		else {
			console.error('==============Jump配置表未找到code = ' + jumpCode);
		}
		return false
	}

	public get activityConstCode(): number {
		return this._activityCode
	}
}

export function jsInstanceof(child: any, parent: any): Boolean {
	const SP = parent.prototype.__classname__; //构造函数原型

	while (child !== null) {
		//===严格比较，同类型同值
		if (child.prototype && child.prototype.__classname__ === SP) return true;

		child = child.__proto__; // 沿着原型链重新赋值
	}
	return false;
}
