# -*- coding: utf-8 -*-
# 切割main
#
#
# chcp 65001
# python sliceMain.py --path ..\..\asset

import os
import shutil
import sys
import argparse
import io
import json
import commands
import re
from types import *
import math
import time
import hashlib
import fileinput, glob, string, sys, os, argparse
import os.path as path
from os.path import join

cutToCount = 2
splitClassList = []


def splitClassDef(classDefStr):
	global splitClassList
	global cutToCount
	pattern = re.compile('\}\],\w+\:\[function\(\w?\,?\w?\,?\w?\)\{')
	group = re.findall(pattern, classDefStr)
	if group:
		count = len(group)
		print "搜索到类的大概数量： ", count
		lastIndex = 0
		for i in range(1, cutToCount):
			index = int(count / cutToCount * i)
			content = group[index]
			print content
			findIndex = classDefStr.find(content)
			print findIndex
			splitClassList.append(classDefStr[lastIndex : findIndex+3])
			lastIndex = findIndex + 3
		splitClassList.append(classDefStr[lastIndex : len(classDefStr)])

	print "原长度: ",len(classDefStr)
	sum = 0
	for s in splitClassList:
		sum = sum + len(s)
	print "裁剪总和: ",sum

def makeJs(str):
	global splitClassList
	ret = """window.gameModule = window.gameModule || {};
var n = {%s};
for(var name in n){window.gameModule[name]=n[name];}
"""
	return ret % str

def makeJs2(funcStr,classNameStr):
	ret = """%s(window.gameModule,{},%s)"""
	return ret % (funcStr, classNameStr)

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description='H5打包脚本')
	parser.add_argument('--path', action="store", dest="path", help='微信工程路径')

	if len(sys.argv) == 1:
		results = parser.parse_args(['-h'])
	else:
		results = parser.parse_args()


	mainJsPath = join(results.path, "subpackages", "main", "game.js")
	if(not path.exists(mainJsPath)):
		print "error: "+mainJsPath+" not exists"
		exit(1)
	with io.open(mainJsPath, 'r') as myfile:
		ss = myfile.read()
		pattern1 = re.compile('(window\.__require=function \w\(\w\,\w\,\w\)\{.*?\})\(\{(.*)\}\,\{\}\,(\[.+?\])\)\;')
		group = re.match(pattern1, ss)
		if group:
			funcStr = group.group(1)
			classDefStr = group.group(2)
			classNameStr = group.group(3)
			print "总长度：\t",len(ss)
			print "函数头长度：\t",len(funcStr)
			print "类定义长度：\t",len(classDefStr)
			print "类名长度：\t",len(classNameStr)
			splitClassDef(classDefStr)
		
			for i in range(0, cutToCount):
				game1Js = makeJs(splitClassList[i])
				name = "main%s"%(i+1)
				if not os.path.exists(join(results.path, "subpackages", name)):
					os.system("mkdir %s" % join(results.path, "subpackages", name))
				with io.open(join(results.path, "subpackages", name, "game.js"), 'w+') as myfile:
					myfile.write(game1Js)


			gameJs = makeJs2(funcStr, classNameStr)
			with io.open(join(results.path, "subpackages", "main", "game.js"), 'w+') as myfile:
				myfile.write(gameJs)


		else :
			print "分包正则匹配失败"





