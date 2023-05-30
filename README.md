# 启动
1. node server.js
2. server.js是服务端的代码，client.js是用户端的代码.其余的是npm install自定生成的代码.
# 说明
1. node 版本 19.0.0
# 其他
1. 关于逻辑判断的有关代码都写在client.js，例如五子棋案例中，判断是否获胜的条件的代码写在了客户端，每一次用户落子，都进行判断。
2. 如果写在了server端，server端还得保存用户对战情况，特别消耗资源。
3. 有的功能没有完善，例如服务端检测异常断开连接的代码(刷新浏览器，不是指正常点击离开按钮)
4. 有关客户端和服务端node的搭建，可以参考该代码，避免了繁琐的版本一致问题。
# 问题
1. 在创建子进程的过程中，如果在父进程和子进程之间又创建webSocket连接，会出现很多问题，例如server.js将server传到support.js没有问题，但是support.js解析server会出现问题。如果用workerprocess.channel通道IPC，会出现function is not defined的错误。
2. 既然创建了子进程也无法将客户端的fd传递到子进程，那就不用webSocket连接父进程和子进程了。直接用worker_process.send()和process.send，process.on()就可以了.
3. [NODE JS API](https://nodejs.org/api/child_process.html#subprocesssendmessage-sendhandle-options-callback)