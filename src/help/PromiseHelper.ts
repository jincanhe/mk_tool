export class PromiseHelper<T> {
    
    promise: Promise<T> = null;
    resolve: (value?: T) => void = null;
    reject: (reason?: any) => void = null;
    isResolved: boolean = false;
    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }


    public then(resolve: (value?: T) => void, reject?: (reason?: any) => void): PromiseHelper<T> {
        this.promise.then(()=>{
            this.isResolved = true;
            resolve();
        }).catch(reject?reject:(err)=>{
            err && console.error(err);
        });
        return this;
    }

}


