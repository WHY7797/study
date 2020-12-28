1. typeof  instanceof
typeof 对于基本类型来说 除了 null 都可以正确的判断类型
typeof 对于对象来说除了函数都会显示 Object
如果想正确判断对象的类型 此时应该用 instanceof , instanceof 是基于原型链来判断的
对于原始类型来说直接用 instanceof 判断是不行的
2.类型转换(Boolean Number String)
1)Boolean
除了 null、 undefined 、false 、0 、 NaN 都会转换成 true
2)Number||String
调用函数内部的[[ToPrimitive]]函数(优先级是最高的) 逻辑是
如果已经是原始类型了就不需要转换了
调用x.valueOf() 如果转换为基础类型 就返回转换的值
调用x.toString() ~~~同上
如果没有返回原始类型就会报错
let a={
    valueOf(){
        return 0
    },
    toString(){
        return 1
    },
    [Symbol.toPrimitive](){//优先级最高
        return 3
    }
}
console.log(a+1)
4. this
对于直接调用函数来说 不管函数被 被放在了什么地方 this 一定是 window 
谁调用了函数谁就是 this 
对于 new 的方式来说 this 永远被绑定在了对象上面 不会被改变
箭头函数的 this 取决于包裹箭头函数的第一个普通函数的 this 
对于 bind 这类函数来说 只取决于第一个函数的 this 如果没有传 则是 window
5.== 和 === 区别
对于 == 来说 
判断对比的对象是否是相同类型如果是则直接比较如果不是就需要做类型转换
判断对比的对象是否是 undefined 或者 null 如果是 直接返回 false
比较两者是否是 String 或者 Number 如果是 就把 String 转换成 Number
对于===来说 类型和值是否相同
7.闭包(一个函数内可以访问另一个函数的参数的参数)
用途就是可以间接访问到函数内部的变量




