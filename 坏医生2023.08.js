// ==UserScript==
// @name         坏医生自动播放与答题
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  打开好医生继续教育页面即可，选择课程可自动完成学习。已适配2023新版答题界面。
// @author       luoyulong
// @match        *://*.cmechina.net/*
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	const fastSkipVideos = false;
	let KeyQuestions = "questions";
	let enabled = true;
	let urlInfos = window.location.href.split("/");
	let urlTip = urlInfos[urlInfos.length - 1].split("?")[0];

	let params = new URLSearchParams(window.location.search);
	let courseId = params.get("courseId");

	let doctor = badDoctor();
	
	console.log(courseId);

	createButton(); // create swith on/off button.


	if (urlTip === "polyv.jsp" || urlTip == "study2.jsp") { //视频页面
		console.log("当前任务: 坏医生看视频");
		if(fastSkipVideos)
		{
		//快速跳过
		setInterval(function () {
		  let video = document.getElementsByTagName('video')
		  for (let i = 0; i < video.length; i++) {
		    video[i].currentTime = video[i].duration
		  }
		}, 200);
		}
		
		doctor.seeVideo()
	} else if (urlTip == "exam.jsp") { //考试页面
		console.log("当前任务: 坏医生考试")
		doctor.doTest()
	} else if (urlTip == "examQuizFail.jsp") { //考试结果页面
		console.log("当前任务: 坏医生考试结果审核")
		setTimeout(function() {
			doctor.doResult();
		}, 1000)
	} else if (urlTip == "examQuizPass.jsp") {
		setTimeout(function() {
			doctor.nexClass()
		}, 1000)

	} else if (urlTip == "course.jsp") {
		console.log("function --- course")
		setTimeout(function() {
			doctor.selectClass()
		}, 1000)
	} else if (urlTip == "apply.jsp") {
		setTimeout(function() {
			doctor.commentClass()
		}, 1500)

	} else if (urlTip == "ewmface.jsp") // 人脸识别
	{
		console.log("pass")
		// 暂时屏蔽跳过人脸识别;
		setTimeout(function() {
			doctor.faceId()
		}, 2000)
	} else if (urlTip == "examCoursePass.jsp") {
		console.log("申请学分")
		setTimeout(function() {
			document.querySelector(".show_exam_btns a")
				.click()
			doctor.commentClass()
		}, 1500)

	}

	function badDoctor() {
		return {
			seeVideo:function () {
				const FOUR_TIMES_SPEED = 4;
				const SIXTEEN_TIMES_SPEED = 16;
				const CHECK_INTERVAL = 1000;
			  
				localStorage.removeItem(KeyQuestions);
				//this.dargonButton(); 
			  
				setInterval(function() {
				  const video = document.querySelector('video');
				  const currentPlaybackRate = video.playbackRate;
			  
				  if (currentPlaybackRate < 10) {
					const targetPlaybackRate = (urlTip === "study2.jsp") ? FOUR_TIMES_SPEED : SIXTEEN_TIMES_SPEED;
					if (currentPlaybackRate !== targetPlaybackRate) {
					  console.log(`当前播放速度为: ${currentPlaybackRate}x --> 调整为: ${targetPlaybackRate}x`);
					  video.playbackRate = targetPlaybackRate;
					}
				  }
			  
				  if (video.paused) {
					console.log("检测到暂停,点击播放");
					video.play();
				  }
			  
				  if (!video.muted) {
					video.muted = true; // 静音
				  }
				}, CHECK_INTERVAL);
			  
				let flag = false;
				document.querySelector("body").onclick = () => {
				  const video = document.querySelector('video');
				  if (flag) {
					video.pause();
					flag = false;
				  } else {
					video.play();
					flag = true;
				  }
				};
			  
				window.s2j_onPlayOver = function() {
				  console.log("播放完毕");
				  gotoExam();
				  console.log("尝试进入考试");
				  // showExam(true);
				  delCookie("playState");
				  addCourseWarePlayRecord();
				  setTimeout(function() {
					document.querySelector(".cur").click();
				  }, 1000);
				};
			  },

			doTest: function() {
				let questionGroup = JSON.parse(localStorage.getItem(KeyQuestions))
				let questionsElem = document.querySelectorAll('li')

				function generateCombinations(chars) {
					let result = [];

					function combine(current, remaining, start) {
						if (current.length >= 2) {
							result.push(current);
						}

						for (let i = start; i < remaining.length; i++) {
							combine(current + remaining[i], remaining.slice(i + 1), i);
						}
					}

					combine('', chars, 0);
					return result;
				}

				if (questionGroup == null) {
					questionGroup = new Array(5);
					for (let i = 0; i < questionsElem.length; i++) {
						let title = questionsElem[i].innerText.split(/[\s\n]/)[0].replace(RegExp(/\d\./), "");
						let letterList = ["A", "B", "C", "D", "E", "F", "G"];
						let optionCount = questionsElem[i].querySelectorAll("p").length;
						
						if (title.includes("多选")) {
							questionGroup[i] = {
								"title": title,
								"option": generateCombinations(letterList.splice(0, optionCount))
							}
						} else {
							questionGroup[i] = {
								"title": title,
								"option": letterList.splice(0, optionCount)
							}
						}
					}
				}
				console.log(questionGroup)
				for (let i = 0; i < questionsElem.length; i++) {
					console.log(questionGroup[i].title)
					if (questionGroup[i].title.includes("多选")) 
					{
						console.log("进入了多选的选题循环")
						for (let lt = 0; lt < questionGroup[i].option[0].length; lt++) {
							questionsElem[i].querySelector("input[value='" + questionGroup[i].option[0][lt] + "']").click();
						}

					} 
					else 
					{
						questionsElem[i].querySelector("input[value='" + questionGroup[i].option[0] + "']").click();
					}
				}
				localStorage.setItem(KeyQuestions, JSON.stringify(questionGroup)); // 存储

				setInterval(function(){
					document.querySelector("#tjkj").click();
				}, 4000)
			},

			doResult: function() {

				let res = document.querySelector(".show_exam_btns").innerText
				if (res == '重新答题') 
				{
					console.log("考试未通过")

					let questionGroup = JSON.parse(localStorage.getItem(KeyQuestions))

					// new function ,2023.08 for huayi.
					let wrongElements = document.querySelectorAll(".answer_list");
					for (let p = 0; p < wrongElements.length; p++) {
						if (wrongElements[p].childNodes[1].className == "cuo") {
							questionGroup[p].option = questionGroup[p].option.splice(1, 25); // 移除错误选项（默认选的第一个），假设错误选项在后面的位置，共25个选项
							// let item = {
							// 	"title": questionGroup[p].title,
							// 	"option": questionGroup[p].option.splice(1, 25)
							// }
							// questionGroup[p] = item;
							console.log("移除错误选项" + questionGroup[p].title);
						}
					}

					localStorage.setItem(KeyQuestions, JSON.stringify(questionGroup));
					document.querySelector("#cxdt").click();
				} 
				else 
				{
					console.log("考试通过")
					document.querySelector(".show_exam_btns a").click();
				}
			},
			nexClass: function() {
				setTimeout(function() {
					document.querySelector(".show_exam_btns a").click()
				}, 1000)
			},
			selectClass: function() {
				let unStudy = document.querySelector(".wxx");
				let studying = document.querySelector(".xxz");
				let urlClass = "https://www.cmechina.net/cme/polyv.jsp?";
				let urlEnd = "&vsign=null";
				if (studying != null) 
				{

					let ids = studying.parentElement.parentElement.innerHTML.split("&amp;vsign=null")[0].split("study2.jsp?")[1];
					window.location.href = urlClass + ids.replace("amp;", "") + urlEnd;

				} 
				else if (unStudy != null) 
				{
					let ids = unStudy.parentElement.parentElement.innerHTML.split("&amp;vsign=null")[0].split("study2.jsp?")[1];
					window.location.href = urlClass + ids.replace("amp;", "") + urlEnd;
				}
			},
			commentClass: function() {
				window.alert = function() {
					return false
				};
				Window.prototype.alert = function() {
					return false
				};
				document.querySelector(".bg-lv")
					.click();
				setTimeout(function() {
					window.location.href = "http://www.cmechina.net/cme/index.jsp"
				}, 1000)
			},
			faceId: function() {
				console.log("人脸识别界面-->准备跳过")
				//window.location.href = videoUrl + courseId
			},

			dargonButton: function() {

				var new_element_N = document.createElement("style");
				new_element_N.innerHTML = '#drager {' +
					'   position: fixed;' +
					'   width: 250px;' +
					'   height: 80px;' +
					'   background-color: rgba(0,0,0, 0.4);' +
					'   z-index: 10000;' +
					'   cursor: pointer;' +
					'   top: 0px;' +
					'   left: 0px;' +
					'   border-radius: 0%;' +
					'   padding: 6px;' +
					' }' +
					' ' +
					' #drager>div {' +
					'   border-radius: 50%;' +
					'   width: 100%;' +
					'   height: 100%;' +
					'   background-color: rgba(0, 0, 0, 0.3);' +
					'   transition: all 0.2s;' +
					'  -webkit-transition: all 0.2s;' +
					'  -moz-transition: all 0.2s;' +
					'  -o-transition: all 0.2s;' +
					' }' +
					' #drager:hover>div{' +
					'   background-color: rgba(0, 0, 0, 0.6);' +
					' } ';
				document.body.appendChild(new_element_N);
				new_element_N = document.createElement('div');
				new_element_N.setAttribute("id", "drager");
				new_element_N.style.top = "250px";
				new_element_N.style.left = "5px";
				new_element_N.innerHTML = ' <div></div>';
				document.body.appendChild(new_element_N);
				//
				//
				var posX;
				var posY;
				var screenWidth = document.documentElement.clientWidth;
				var screenHeight = document.documentElement.clientHeight;
				var fdiv = document.getElementById("drager");
				fdiv.onmousedown = function(e) {
					screenWidth = document.documentElement.clientWidth;
					screenHeight = document.documentElement.clientHeight;
					if (!e) {
						e = window.event;
					} //IE
					posX = e.clientX - parseInt(fdiv.style.left);
					posY = e.clientY - parseInt(fdiv.style.top);
					document.onmousemove = mousemove;
				}
				document.onmouseup = function() //释放时自动贴到最近位置
				{
					document.onmousemove = null;
					if ((parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight) / 2) <= (screenHeight / 2)) { //在上半部分
						if ((parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2) <= (screenWidth / 2)) { //在左半部分
							if ((parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight) / 2) <= (parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2)) { //靠近上方
								fdiv.style.top = "0px";
							} else { //靠近左边
								fdiv.style.left = "0px";
							}
						} else { //在右半部分
							if ((parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight) / 2) <= (screenWidth - (parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2))) { //靠近上方
								fdiv.style.top = "0px";
							} else { //靠近右边
								fdiv.style.left = (screenWidth - parseInt(fdiv.clientWidth)) + "px";
							}
						}
					} else { //下半部分
						if ((parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2) <= (screenWidth / 2)) { //在左半部分
							if ((screenHeight - (parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight) / 2)) <= (parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2)) { //靠近下方
								fdiv.style.top = (screenHeight - parseInt(fdiv.clientHeight)) + "px";
							} else { //靠近左边
								fdiv.style.left = "0px";
							}
						} else { //在右半部分
							if ((screenHeight - (parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight) / 2)) <= (screenWidth - (parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth) / 2))) { //靠近上方
								fdiv.style.top = (screenHeight - parseInt(fdiv.clientHeight)) + "px";
							} else { //靠近右边
								fdiv.style.left = (screenWidth - parseInt(fdiv.clientWidth)) + "px";
							}
						}
					}
				}

				function mousemove(ev) {
					if (ev == null) {
						ev = window.event;
					} //IE
					if ((ev.clientY - posY) <= 0) { //超过顶部
						fdiv.style.top = "0px";
					} else if ((ev.clientY - posY) > (screenHeight - parseInt(fdiv.clientHeight))) { //超过底部
						fdiv.style.top = (screenHeight - parseInt(fdiv.clientHeight)) + "px";
					} else {
						fdiv.style.top = (ev.clientY - posY) + "px";
					}

					if ((ev.clientX - posX) <= 0) { //超过左边
						fdiv.style.left = "0px";
					} else if ((ev.clientX - posX) > (screenWidth - parseInt(fdiv.clientWidth))) { //超过右边
						fdiv.style.left = (screenWidth - parseInt(fdiv.clientWidth)) + "px";
					} else {
						fdiv.style.left = (ev.clientX - posX) + "px";
					}
					// console.log( posX +" "+ fdiv.style.left);

				}
				window.onload = window.onresize = function() { //窗口大小改变事件
					screenWidth = document.documentElement.clientWidth;
					screenHeight = document.documentElement.clientHeight;
					if ((parseInt(fdiv.style.top) + parseInt(fdiv.clientHeight)) > screenHeight) { //窗口改变适应超出的部分
						fdiv.style.top = (screenHeight - parseInt(fdiv.clientHeight)) + "px";
					}
					if ((parseInt(fdiv.style.left) + parseInt(fdiv.clientWidth)) > screenWidth) { //窗口改变适应超出的部分
						fdiv.style.left = (screenWidth - parseInt(fdiv.clientWidth)) + "px";
					}
					document.onmouseup.apply()
				};
				fdiv.addEventListener('touchstart', fdiv.onmousedown, false);
				fdiv.addEventListener('touchmove', function(event) {
					// 如果这个元素的位置内只有一个手指的话
					if (event.targetTouches.length == 1) {
						event.preventDefault(); // 阻止浏览器默认事件，重要
						var touch = event.targetTouches[0];
						if ((touch.pageY) <= 0) { //超过顶部
							fdiv.style.top = "0px";
						} else if (touch.pageY > (screenHeight - parseInt(fdiv.clientHeight))) { //超过底部
							fdiv.style.top = (screenHeight - parseInt(fdiv.clientHeight)) + "px";
						} else {
							fdiv.style.top = (touch.pageY - parseInt(fdiv.clientHeight) / 2) + "px";
						}

						if (touch.pageX <= 0) { //超过左边
							fdiv.style.left = "0px";
						} else if (touch.pageX > (screenWidth - parseInt(fdiv.clientWidth))) { //超过右边
							fdiv.style.left = (screenWidth - parseInt(fdiv.clientWidth)) + "px";
						} else {
							fdiv.style.left = (touch.pageX - parseInt(fdiv.clientWidth) / 2) + "px";
						}
					}
				}, false);
				fdiv.addEventListener('touchend', document.onmouseup, false);
				new_element_N.innerText = "  坏医生自动学习 适配 2023 新版\r\n1.双击跳过视频【disabled】\r\n2.单击任意位置播放/暂停【enabled】\r\n3.如无法跳过视频，请手动刷新网页\r\n4.仅供个人学习使用，不承担任何责任";
				new_element_N.style.fontSize = "12px";
				new_element_N.style.color = "white";
				new_element_N.fontStyle = "normal";
				fdiv.ondblclick = function() { //双击事件可能在手机端浏览器会与网页缩放事件冲突
					setInterval(function() {
						let video = document.getElementsByTagName('video')
						for (let i = 0; i < video.length; i++) {
							video[i].currentTime = video[i].duration
						}
					}, 200);
				}

			}
		}
	}
	function createButton() {
		if (urlTip !== "polyv.jsp") {
		  return;
		}
	  
		// 创建按钮元素
		let button = document.createElement("button");
		button.id = "id001";
		button.value = "true";
		updateButtonAppearance(true); // 设置按钮初始外观
		button.onclick = function() {
		  toggleButton();
		};
	  
		document.querySelector(".j_back").appendChild(button);
	  
		// 切换按钮状态的函数
		function toggleButton() {
		  if (button.value === "true") {
			button.value = "false";
			enabled = false;
		  } else {
			button.value = "true";
			enabled = true;
		  }
		  updateButtonAppearance(enabled);
		}
	  
		// 更新按钮外观的函数
		function updateButtonAppearance(enabled) {
		  button.textContent = enabled ? "脚本开启(单击切换)" : "脚本关闭";
		  button.style.backgroundColor = enabled ? "green" : "red";
		}
	  }
})();