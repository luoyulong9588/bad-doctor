// ==UserScript==
// @name         坏医生自动播放与答题22
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  打开好医生继续教育页面即可，选择课程可自动完成学习。已适配2023新版答题界面。
// @author       luoyulong
// @match        *://*.cmechina.net/*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

     // 允许右键点击
    document.oncontextmenu = function(event) {

        return true;
    };


    document.onkeydown = document.onkeyup = document.onkeypress = function(event) {
        let e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 123) {

            return true;
        }

        return;
    };



	const fastSkipVideos = false;
	let KeyQuestions = "questions";
	let enabled = true;
	let urlInfos = window.location.href.split("/");
	let urlTip = urlInfos[urlInfos.length - 1].split("?")[0];

	let params = new URLSearchParams(window.location.search);
	let courseId = params.get("courseId");

	let doctor = badDoctor();


	// createButton(); // create swith on/off button.


	if (urlTip === "polyv.jsp" || urlTip == "study2.jsp") { //视频页面
		console.log("当前任务: 坏医生看视频");
		if (fastSkipVideos) {

			//快速跳过
			setInterval(function () {
				let video = document.getElementsByTagName('video')
				for (let i = 0; i < video.length; i++) {
					video[i].currentTime = video[i].duration
				}
			}, 200);
			window.s2j_onPlayOver = function () {
				console.log("播放完毕");
				gotoExam();
				console.log("尝试进入考试");
				setTimeout(function () {
					document.querySelector(".cur").click();
				}, 1000);
			};
			console.log("准备考试,移除本地数据")
			localStorage.removeItem(KeyQuestions);
			return;
		}

		doctor.seeVideo()
	} else if (urlTip == "exam.jsp") { //考试页面
		console.log("当前任务: 坏医生考试")
		doctor.doTest()
	} else if (urlTip == "examQuizFail.jsp") { //考试结果页面
		console.log("当前任务: 坏医生考试结果审核")
		setTimeout(function () {
			doctor.doResult();
		}, 1000)
	} else if (urlTip == "examQuizPass.jsp") {
		setTimeout(function () {
			doctor.nexClass()
		}, 1000)

	} else if (urlTip == "course.jsp") {
		console.log("function --- course")
		setTimeout(function () {
			doctor.selectClass()
		}, 1000)
	} else if (urlTip == "apply.jsp") {
		setTimeout(function () {
			doctor.commentClass()
		}, 1500)

	} else if (urlTip == "ewmface.jsp") // 人脸识别
	{
		console.log("pass")
		// 暂时屏蔽跳过人脸识别;
		setTimeout(function () {
			doctor.faceId()
		}, 2000)
	} else if (urlTip == "examCoursePass.jsp") {
		console.log("申请学分")
		setTimeout(function () {
			document.querySelector(".show_exam_btns a")
				.click()
			doctor.commentClass()
		}, 1500)

	}

	function badDoctor() {
		return {
			seeVideo: function () {
				localStorage.removeItem(KeyQuestions);
				// //this.dargonButton();
				playEnd();
				gotoExam();
				// const FOUR_TIMES_SPEED = 4;
				// const SIXTEEN_TIMES_SPEED = 16;
				// const CHECK_INTERVAL = 1000;

				// localStorage.removeItem(KeyQuestions);
				// //this.dargonButton();

				// setInterval(function () {
				// 	const video = document.querySelector('video');
				// 	const currentPlaybackRate = video.playbackRate;

				// 	if (currentPlaybackRate < 10) {
				// 		const targetPlaybackRate = (urlTip === "study2.jsp") ? FOUR_TIMES_SPEED : SIXTEEN_TIMES_SPEED;
				// 		if (currentPlaybackRate !== targetPlaybackRate) {
				// 			console.log(`当前播放速度为: ${currentPlaybackRate}x --> 调整为: ${targetPlaybackRate}x`);
				// 			video.playbackRate = targetPlaybackRate;
				// 		}
				// 	}

				// 	if (video.paused) {
				// 		console.log("检测到暂停,点击播放");
				// 		video.play();
				// 	}

				// 	if (!video.muted) {
				// 		video.muted = true; // 静音
				// 	}
				// }, CHECK_INTERVAL);

				// let flag = false;
				// document.querySelector("body").onclick = () => {
				// 	const video = document.querySelector('video');
				// 	if (flag) {
				// 		video.pause();
				// 		flag = false;
				// 	} else {
				// 		video.play();
				// 		flag = true;
				// 	}
				// };

				// window.s2j_onPlayOver = function () {
				// 	console.log("播放完毕");
				// 	gotoExam();
				// 	console.log("尝试进入考试");
				// 	setTimeout(function () {
				// 		document.querySelector(".cur").click();
				// 	}, 1000);
				// };


			},

			doTest: function () {

				function generateAllCombinations(arr) {
					// 用于存储所有组合的数组
					const combinations = [];

					// 递归函数，用于生成组合
					function buildCombinations(start, currentCombo) {
						// 如果当前组合长度大于等于2，则将其添加到结果数组中
						if (currentCombo.length >= 2) {
							combinations.push(currentCombo.slice()); // 使用slice()创建副本
						}

						// 从start开始遍历数组中的每个元素
						for (let i = start; i < arr.length; i++) {
							// 将当前元素添加到组合中
							const newCombo = currentCombo.concat(arr[i]);
							// 递归调用buildCombinations，继续生成包含当前元素的组合
							buildCombinations(i + 1, newCombo);
						}
					}

					// 从数组的第一个元素开始生成组合
					buildCombinations(0, []);

					// 返回所有组合
					return combinations;
				}

				console.log("exam~~~")
				let questionGroup = objectToMap(JSON.parse(localStorage.getItem(KeyQuestions)));
				console.log("read quesitons")
				console.log(questionGroup)
				console.log("read success")
				let questionsElem = document.querySelectorAll('li')
				let single = true;

				if (questionGroup.size == 0) {
					console.log("exam~~~questionGroup~~null")
					questionGroup = new Map();	//改为Map
					for (let i = 0; i < questionsElem.length; i++) {
						let title = questionsElem[i].innerText.split(/[\n\n]/)[0].replace(RegExp(/\d\./), "").replace(/[\u000b-\u001F\u007F-\u009F]/g, '');;
						let optionsArray = [];
						if (title.includes("单选")) { single = true } else { single = false }
						title = title.replace("【单选】", '').replace("【多选】", '').replace().replace(/^\d+[、．.]/, '');
						let letterList = ["A", "B", "C", "D", "E", "F", "G"];
						let optionGroup = new Map();
						let optionsElement = questionsElem[i].querySelectorAll("p");
						const regexForOption = /[A-Z]+:\s*/;


						// 循环获取选项，移除ABCD，存入Json
						for (let p = 0; p < optionsElement.length; p++) {
							let result = optionsElement[p].innerText.replace(regexForOption, ''); // 选项的值
							var opt = new Map();
							opt.set("number", letterList[p])
							opt.set("content", result)
							opt.set("statue", null)
							optionGroup.set(result, opt); // 使用选项作为索引
							optionGroup.set(letterList[p], result); // 再次存入一组，为后面的移除错题做选择，可以避免一个循环~~~
							if(!single)
							{
								optionsArray.push(result);
							}
						}

						//optionGroup 样式：{"A":"xxx","B":"XXX"}
						var que = new Map();
						que.set("title", title);
						que.set("option", optionGroup);
						que.set("single", single);
						if(!single){ // 多选
							// 把所有组合存入一个新的，MultipleCombination,数组;
							let multCombination = generateAllCombinations(optionsArray);
							que.set("multCombination", multCombination);
							optionsArray = [];
						}
						questionGroup.set(title, que)
					}
					console.log(questionGroup)
				}
				else // 矫正每个选项的ABCD对应内容，以及顺序，每道题的顺序是不一致的，后面移除错误选项的时候，是通过index移除，这里需要重新排序。
				{
					console.log("exam~~~questionGroup~~not~~null")

					let newQuestionGroup = new Map();
					for (let i = 0; i < questionsElem.length; i++) {
						let title = questionsElem[i].innerText.split(/[\n\n]/)[0].replace(RegExp(/\d\./), "").replace(/[\u000b-\u001F\u007F-\u009F]/g, '');;
						let optionsArray = [];
						if (title.includes("单选")) { single = true } else { single = false }
						title = title.replace("【单选】", '').replace("【多选】", '').replace().replace(/^\d+[、．.]/, '');
						let letterList = ["A", "B", "C", "D", "E", "F", "G"];
						let optionGroup = new Map();
						//	let optionCount = questionsElem[i].querySelectorAll("p").length;
						let optionsElement = questionsElem[i].querySelectorAll("p");
						const regexForOption = /[A-Z]+:\s*/;

						// 循环获取选项，移除ABCD，存入Json
						for (let p = 0; p < optionsElement.length; p++) {
							let result = optionsElement[p].innerText.replace(regexForOption, '');
							var opt = new Map();
							opt.set("number", letterList[p]);
							opt.set("content", result);
							opt.set("statue", questionGroup.get(title).get("option").get(result).get("statue"));
							optionGroup.set(result, opt);
							optionGroup.set(letterList[p], result); // 再次存入一组，为后面的移除错题做选择，可以避免一个循环~~~
						}

						//optionGroup 样式：{"A":"xxx","B":"XXX"}
						var que = new Map();
						que.set("title", title);
						que.set("option", optionGroup);
						que.set("single", single);
						if(!single)
						{
							let multCombination = questionGroup.get(title).get('multCombination'); //如果是多选，把原有可能组合数组存入新的Map

							que.set("multCombination", multCombination);

						}

						newQuestionGroup.set(title, que);
					}
					questionGroup = newQuestionGroup;
					console.log("new question Group")
					console.log(newQuestionGroup)
				}

				for (let i = 0; i < questionsElem.length; i++) {
					let cycleTitle = questionsElem[i].innerText.split(/[\n\n]/)[0].replace(RegExp(/\d\./), "").replace("【单选】", '').replace("【多选】", '').replace(/[\u000b-\u001F\u007F-\u009F]/g, '');;
					if (!questionGroup.get(cycleTitle).get('single')) {
						console.log("多选模式");
						console.log(cycleTitle)
						console.log(questionGroup)
						console.log('debugsuccess')
						let multCombsArray = questionGroup.get(cycleTitle).get("multCombination");
						console.log(multCombsArray);
						for(let combsArray of multCombsArray[0]) // 只取第一个，作为当前选项，如果错误，则移除第一个
						{
							console.log("多选准备选择-->")
							console.log(combsArray)
							let number  =  questionGroup.get(cycleTitle).get('option').get(combsArray).get('number');
							questionsElem[i].querySelector("input[value='" +number + "']").click();
						}

					}
					else {

						console.log("单选模式")

						for (let [key, value] of questionGroup.get(cycleTitle).get('option')) {
							try {
								value.get("statue");
							} catch (TypeError) {
								continue;
							}

							if (value.get("statue") == true) {
								questionsElem[i].querySelector("input[value='" + value.get("number") + "']").click();
								break;
							}
							if (value.get("statue") == null) {
								questionsElem[i].querySelector("input[value='" + value.get("number") + "']").click();

							}

						}

					}
				}
				localStorage.setItem(KeyQuestions, JSON.stringify(mapToObject(questionGroup))); // 存储
				console.log(questionGroup)

				setInterval(function () {
					document.querySelector("#tjkj").click();
				}, 4000)
			},

			doResult: function () {

				let res = document.querySelector(".show_exam_btns").innerText
				if (res == '重新答题') {
					console.log("考试未通过")
					let questionGroup = objectToMap(JSON.parse(localStorage.getItem(KeyQuestions)));
					console.log("read~success!")
					console.log(questionGroup)


					let checkElements = document.querySelectorAll(".answer_list");
					for (let p = 0; p < checkElements.length; p++) {
						let checkLetters = checkElements[p].childNodes[1].innerText.split("您的答案：")[1].trim().split('\n')[0];
						let checkTitle = checkElements[p].childNodes[1].innerText.split("您的答案：")[0].replace(/^\d+[、．]/, '').trim().replace(/[\u000b-\u001F\u007F-\u009F]/g, '');;

						if (!questionGroup.get(checkTitle).get('single')){

							if (checkElements[p].childNodes[1].className == "cuo"){
								console.log("为多选移除错误组合：");
								console.log(questionGroup.get(checkTitle).get("multCombination")[0]);
								let newArray = questionGroup.get(checkTitle).get("multCombination");
								newArray.shift();
								questionGroup.get(checkTitle).set("multCombination", newArray);
								console.log("移除错误组合成功!");
							}
							if (checkElements[p].childNodes[1].className == "dui") {
								console.log("为多选设置正确组合：");
								console.log(questionGroup.get(checkTitle).get("multCombination")[0]);
								let newArray = [questionGroup.get(checkTitle).get("multCombination")[0]];
								questionGroup.get(checkTitle).set("multCombination",newArray);

							}
							continue;
						}



						for(let letter of checkLetters) // 单选题才需要遍历每个选项
						{
							let optContent = questionGroup.get(checkTitle).get('option').get(letter);

							if (checkElements[p].childNodes[1].className == "cuo") {
								console.log("准备移除“" + checkTitle + "”的错误选项" + ":" + letter)
								console.log(questionGroup.get(checkTitle))
								questionGroup.get(checkTitle).get('option').get(optContent).set('statue', false);
								console.log("移除错误选项成功");
							}

							if (checkElements[p].childNodes[1].className == "dui") {
								console.log("准备添加“" + checkTitle + "”的正确选项" + ":" + letter)
								console.log(questionGroup.get(checkTitle));
								questionGroup.get(checkTitle).get('option').get(optContent).set('statue', true);
								console.log("添加正确选项成功！")
							}

						}

					}
					localStorage.setItem(KeyQuestions, JSON.stringify(mapToObject(questionGroup))); // 存储
					console.log(questionGroup);
					document.querySelector("#cxdt").click();
				}
				else {
					console.log("考试通过,移除本地数据")
					localStorage.removeItem(KeyQuestions);
					document.querySelector(".show_exam_btns a").click();
				}
			},
			nexClass: function () {
				setTimeout(function () {
					document.querySelector(".show_exam_btns a").click()
				}, 1000)
			},
			selectClass: function () {
				let unStudy = document.querySelector(".wxx");
				let studying = document.querySelector(".xxz");
				let urlClass = "https://www.cmechina.net/cme/polyv.jsp?";
				//https://www.cmechina.net/cme/polyv.jsp?course_id=202300999899&courseware_id=14
				//https://www.cmechina.net/cme/study2.jsp?course_id=202300999899&courseware_id=10  特殊
				//let urlEnd = "&vsign=null";
				if (studying != null) {

					let ids = studying.parentElement.parentElement.innerHTML.split("&amp;vsign=null")[0].split("','")[0].split("study2.jsp?")[1];
					window.location.href = urlClass + ids.replace("amp;", "");

				}
				else if (unStudy != null) {
					let ids = unStudy.parentElement.parentElement.innerHTML.split("&amp;vsign=null")[0].split("','")[0].split("study2.jsp?")[1];
					window.location.href = urlClass + ids.replace("amp;", "");
				}
			},
			commentClass: function () {
				window.alert = function () {
					return false
				};
				Window.prototype.alert = function () {
					return false
				};
				document.querySelector(".bg-lv")
					.click();
				setTimeout(function () {
					window.location.href = "http://www.cmechina.net/cme/index.jsp"
				}, 1000)
			},
			faceId: function () {
				console.log("人脸识别界面-->准备跳过")
				window.location.href = videoUrl + courseId
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
		button.onclick = function () {
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
	function mapToObject(map) {
		let obj = Object.create(null);
		for (let [key, value] of map) {
			if (value instanceof Map) {
				obj[key] = mapToObject(value); // 递归转换嵌套的 Map
			} else {
				obj[key] = value;
			}
		}
		return obj;
	}
	// 定义一个函数，用于将可序列化的对象转换回 Map
	function objectToMap(obj) {
		let map = new Map();
		for (let key in obj) {
			if (obj.hasOwnProperty(key)) { // 确保只处理对象自身的属性，而不是原型链上的属性
				let value = obj[key];
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					map.set(key, objectToMap(value)); // 递归转换嵌套的对象
				} else {
					map.set(key, value);
				}
			}
		}
		return map;
	}
})();