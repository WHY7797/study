/*
自定义Promise函数模块  匿名函数自调用(IIFE)
*/
(function(window){
    const PENDING='pending'
    const RESOLVED='resolved'
    const REJECTED='rejected'
    /*
        Promise构造函数
        excutor:执行器函数（同步执行）
    */
    function Promise(excutor){
        const self=this//将当前Promise对象保存起来
        self.status=PENDING//给Promise对象指定status属性，初始值为pending
        self.data=undefined//给Promise对象指定一个用于存储结果数据的属性
        self.callbacks=[]//每个元素的结构:{onResolved(){},onRejected(){}}
        function resolve(value){
            //如果当前状态不是pending直接return
            if(self.status!==PENDING){
                return
            }
            //将状态改成resolved
            self.status=RESOLVED
            //保存value数据
            self.data=value
            //如果有待执行的callbacks函数，立即异步执行回调函数
            if(self.callbacks.length>0){
                setTimeout(()=>{//放入队列中执行所有成功的回调
                    self.callbacks.forEach(callbacksObj=>{
                        callbacksObj.onResolved(value)
                    })
                })
            }
        }
        function reject(reason){
            //如果当前状态不是pending直接return
            if(self.status!==PENDING){
                return
            }
            //将状态改成rejected
            self.status=REJECTED
            //保存reason数据
            self.data=reason
            //如果有待执行的callbacks函数，立即异步执行回调函数
            if(self.callbacks.length>0){
                setTimeout(()=>{//放入队列中执行所有失败的回调
                    self.callbacks.forEach(callbacksObj=>{
                        callbacksObj.onRejected(reason)
                    })
                })
            }
        }
        //立即同步执行excutor执行器函数
        try{//如果执行器抛出异常，Promise对象变为rejected
            excutor(resolve,reject)
        }catch(error){
            reject(error)
        }
    }
    /*
        Promise的then()方法
        指定成功和失败的回调函数
        返回一个新的Promise对象
    */
    Promise.prototype.then=function(onResolved,onRejected){
       const self=this//将当前Promise对象保存起来
       onResolved = typeof onResolved ==='function'?onResolved:value => value//向后传递成功的value
       //指定默认的失败的回调(实现错误/异常穿透的关键点)
       onRejected = typeof onRejected ==='function'?onRejected:reason => {throw reason}//向后传递失败的reason
       //返回一个新的Promise对象
       return new Promise((resolve,reject)=>{
           /*
                调用指定的回调函数处理，根据执行的结果，改变return的promise状态
           */
           function handle(callback){
               //1.如果抛出异常，return的Promise就会失败，reason就是error
               //2.如果回调函数执行返回不是Promise，return的Promise就会成功，value就是返回的值
               //3.如果回调函数执行返回是Promise，return的Promise结果就是这个Promise的结果
                try{
                    const result = callback(self.data)
                    if(result instanceof Promise){
                        //3.如果回调函数执行返回是Promise，return的Promise结果就是这个Promise的结果
                        result.then(
                            value=>resolve(value),//当result成功时，让return的Promise也成功
                            reason=>reject(reason),//当result失败时，让return的Promise也失败
                        )
                    }else{
                        //2.如果回调函数执行返回不是Promise，return的Promise就会成功，value就是返回的值
                        resolve(result)
                    }
                }catch(error){
                    //1.如果抛出异常，return的Promise就会失败，reason就是error
                    alert('sssss')
                    console.log(error)
                    reject(error)
                }
           }
           if(self.status===PENDING){
                //当前状态还是pending状态，将回调函数保存起来
                self.callbacks.push({
                    onResolved(value){
                        handle(onResolved)
                    },
                    onRejected(reason){
                        handle(onRejected)
                    }
                })
           }else if(self.status===RESOLVED){//如果当前是resolve状态，异步执行onResolved并改变return的Promise状态
                setTimeout(()=>{
                    handle(onResolved)
                })
           }else{//如果当前是rejected状态，异步执行onRejected并改变return的Promise状态
                setTimeout(()=>{
                    handle(onRejected)
                })
           }
       })
    }
    /*
        Promise的catch方法
        指定失败的回调函数
        返回一个新的Promise对象
    */
    Promise.prototype.catch=function(onRejected){
        return this.then(undefined,onRejected)
    }
    /*
        Promise函数对象的resolve方法
        返回一个指定结果的成功的Promise
    */
    Promise.resolve=function(value){
        //返回一个成功/失败的Promise
        return new Promise((resolve,reject)=>{
            if(value instanceof Promise){//value是Promise 使用value的结果作为当前Promise的结果
                value.then(resolve,reject)
            }else{//value不是Promise => Promise 成功
                resolve(value)
            }
        })
    }
    /*
        Promise函数对象的reject方法
        返回一个指定结果的失败的Promise
    */
    Promise.reject=function(reason){
        //返回一个失败的Promise
        return new Promise((resolve,reject)=>{
            reject(reason)
        })
    }
    /*
        Promise函数对象的all方法
        返回一个新的Promise只有当所有Promise都成功时才成功，否则只要有一个失败的就失败
    */
    Promise.all=function(promises){
        const values=new Array(promises.length)//用来保存所有成功value的Promise
        //用来保存成功Promise的数量
        let  resolvedCount=0
        return new Promise((resolve,reject)=>{
            //遍历获取每个Promise的结果
            promises.forEach((p,index)=>{
                Promise.resolve(p).then(
                    value=>{
                        resolvedCount++//成功的数量加1
                        //p成功，将成功的value保存values
                        values[index]=value
                        //如果全部成功了，将return的promise改为成功
                        if(resolvedCount===promises.length){
                            resolve(value)
                        }
                    },
                    reason=>{//只要一个失败，return的Promise都失败
                        reject(reason)
                    }
                )
            })
        })
    }
    /*
        Promise函数对象的race方法
        返回一个新的Promise,结果由第一个完成的Promise决定
    */
    Promise.race=function(promises){
        //返回一个Promise
        return new Promise((resolve,reject)=>{
            //遍历取出每个Promise的结果
            promises.forEach((p,index)=>{
                Promise.resolve(p).then(
                    value=>{//一旦有成功了将return变为成功
                        resolve(value)
                    },
                    reason=>{//一旦有成功了将return变为成功
                        reject(reason)
                    }
                )
            })
        })
    }
    /*
  返回一个promise对象，它在指定的时间后才确定结果
  (在Promise.resolve()上加setTimeout)
  */
  Promise.resolveDelay = function(value, time) {
    // 返回一个成功/失败的promise
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (value instanceof Promise) {// value是promise，使用value的结果作为new的promise的结果
          value.then(resolve, reject)
        } else { // value不是promise => promise变为成功，数据是value
          resolve(value)
        }
      }, time)
      
    })
  }

  /*
  返回一个promise对象，它在指定的时间后才失败
  */
  Promise.rejectDelay = function(reason, time) {
    // 返回一个失败的promise
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(reason)
      }, time)
    })
  }
    window.Promise=Promise
})(window)