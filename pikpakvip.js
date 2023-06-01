#!name= pikpak刷邀请
#!desc=id的获取方法，登录app或者网页随便注册个邮箱点发送验证码已收到获取成功通知为准,邀请码可填argument里
#脚本的逻辑就是模拟注册新用户刷邀请码



[MITM]
hostname = %APPEND% user.mypikpak.com


[Script]
//获取id
pikpak _id = type=http-request,pattern=^https:\/\/user\.mypikpak\.com\/v1\/auth\/verification$,requires-body=0,script-path=https://raw.githubusercontent.com/canxin121/loon/main/pikpak.js
//刷邀请
pikpak刷邀请 = type=cron,cronexp=35 3 * * *,wake-system=1,timeout=15,script-path=pikpak.js,argument=0 //填邀请码
