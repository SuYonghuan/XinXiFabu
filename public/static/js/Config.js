window.QM_Line_Father = function(sPoint,ePoint,ctrlPoint1,ctrlPoint2,isStrLine) {
	this.startPoint = sPoint;     //起始点
	this.endPoint =  ePoint;        //结束点
	this.ctrlPoint1 = ctrlPoint1;
	this.ctrlPoint2 = ctrlPoint2;
	this.isStrLine = isStrLine;    //是否是直线
}

let Map_QM, shopData, mapObj, mapJSON, shopJSON;
let deviceSite={"floorOrder":1,"angle":0,"x":0,"y":0,"navPoint":1};

ConfigFun = function () {
	this.spriteMaterialArr = [];
	this.shopHeight=10;

	this.pocHeight = 18;
	this.Point = function (x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

  this.getMapInfo = function (mallCode,mallName="",buildOrder=0){
    let url = "http://saas.1000my.com:8013";
    let tim = Config.timeStamp();
    let token = encodeURIComponent(Config.encrypt("/api/CDN/GetMapInfo" + tim));
    Config.requestNoJM({
      method: "POST",
      data: JSON.stringify({ "mallCode": mallCode, "key": mallName + "editor" }),
      url: url + '/api/CDN/GetMapInfo?token=' + token + '&time=' + tim,
      success: (res) => {
        if (res.code == "200") {
          mapJSON = res.data;
          tim = Config.timeStamp();
          token = encodeURIComponent(Config.encrypt("/api/Shop/QueryShopListForMap" + tim));
          param = Config.encrypt(JSON.stringify({ "mallCode": mallCode, "BuildingOrder": buildOrder}));
          if (url.search("saas")!==-1) {
            Config.request({
              method: "POST",
              data: param,
              url: url + '/api/Shop/QueryShopListForMap?token=' + token + '&time=' + tim,
              success: (res) => {
                if (res.code == "200") {
                  shopJSON = res.data;
                  Config.initData(mapJSON,shopJSON);
                }
              },
              fail: () => {
                console.log("QueryShopListForMap 接口失败");
              }
            });
          } else {
            Config.requestNoJM({
              method: "POST",
              data: JSON.stringify({ "mallCode": mallCode, "BuildingOrder": buildOrder }),
              url: url + '/api/Shop/QueryShopListForMap',
              success: (res) => {
                if (res.code == "200") {
                  shopJSON = res.data;
                  Config.initData(mapJSON,shopJSON);
                }
              },
              fail: () => {
                console.log("QueryShopListForMap 接口失败");
              }
            });
          }
        }
      },
      fail: () => {
        console.log("GetMapInfo 接口失败");
      }
    });
  }
  this.setDeviceSite = function (obj){
    deviceSite.navPoint = obj.hasOwnProperty("navPoint")?obj.navPoint : deviceSite.navPoint;
    deviceSite.angle = obj.hasOwnProperty("angle")?obj.angle : deviceSite.angle;
    deviceSite.floorOrder = obj.hasOwnProperty("floorOrder")?obj.floorOrder : deviceSite.floorOrder;
    console.log(deviceSite);
    if(mapObj){
      let pathArr = mapObj.mapData.path.nodes;
      try{
        deviceSite.x = pathArr[parseInt(deviceSite.navPoint)].x;
        deviceSite.y = -1*pathArr[parseInt(deviceSite.navPoint)].y;
      }catch(error){
        console.error("未找到点");
        deviceSite.x = 0;
        deviceSite.y = 0;
      }
      Map_QM.floor.setStartSite();
    }
  }
  //mapJSON 地图数据json    shopJSON 店铺数据    device 设备点位OBJ {x, y, floorOrder}
  this.initData = function (mapJSON,shopJSON){
    console.log(mapJSON,shopJSON);

    let array = JSON.parse(mapJSON.mapData);
    let mapArray;
    if(array.length>1){
      mapArray = array[1].buildArr;
    }else{
      mapArray = array[0] && array[0].buildArr;
    }
    mapObj = mapArray[parseInt(deviceSite.floorOrder)];

    let shopArray = shopJSON;
    shopData = shopArray[parseInt(deviceSite.floorOrder)];
    Map_QM = new MainMap_QM();
    Map_QM.initBuild();
  }

	/**
	 * 检测点是否在多边形区域内
	 */
	this.checkBoundary = function (p, ptPolygon) {
		// 判断边界方法
		let nCount = ptPolygon.length;
		let nCross = 0;
		for (let i = 0; i < nCount; i++) {
			let p1 = ptPolygon[i]; //当前节点
			let p2 = ptPolygon[(i + 1) % nCount]; //下一个节点
			// 求解 y=p.y 与 p1p2 的交点
			if (p1.y == p2.y) // p1p2 与 y=p0.y平行
				continue;
			if (p.y < Math.min(p1.y, p2.y)) // 交点在p1p2延长线上
				continue;
			if (p.y >= Math.max(p1.y, p2.y)) // 交点在p1p2延长线上
				continue;
			// 从P发射一条水平射线 求交点的 X 坐标 ------原理: ((p2.y-p1.y)/(p2.x-p1.x))=((y-p1.y)/(x-p1.x))
			//直线k值相等 交点y=p.y
			let x = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
			if (x > p.x)
				nCross++; // 只统计单边交点
		}
		// 单边交点为偶数，点在多边形之外 ---
		return (nCross % 2 == 1);
	}

	this.request = function (params) {
		params.method = params.method || 'GET';
		let xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				//console.log(xmlhttp.responseText);
				let data = Config.decrypt(xmlhttp.responseText);
				let jsonObject = JSON.parse(data);
				if (jsonObject.code == "200") {
					params.success(jsonObject);
				}
			}
			if (xmlhttp.readyState === 4 && (xmlhttp.status === 404 || xmlhttp.status === 405)) {
				params.fail();
			}
		};
		xmlhttp.onerror = function (e) {
			params.fail();
		};
		xmlhttp.open(params.method, params.url, true);
		xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.setRequestHeader("Access-Control-Allow-Method", "POST,GET");
		xmlhttp.send(params.data);
	}
	this.requestNoJM = function (params) {
		params.method = params.method || 'GET';
		let xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				let jsonObject;
				try {
					jsonObject = JSON.parse(xmlhttp.responseText);
				} catch (e) {
					params.fail();
					return;
				}
				if (jsonObject.code == "200") {
					params.success(jsonObject);
				}
			}
			if (xmlhttp.readyState === 4 && (xmlhttp.status === 404 || xmlhttp.status === 405)) {
				params.fail();
			}
		};
		xmlhttp.onerror = function (e) {
			params.fail();
		};
		xmlhttp.open(params.method, params.url, true);
		xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
		xmlhttp.setRequestHeader("Content-type", "application/json");
		xmlhttp.setRequestHeader("Access-Control-Allow-Method", "POST,GET");
		xmlhttp.send(params.data);
	}
	//加密
	this.encrypt = function (word, keyStr) {
		keyStr = keyStr ? keyStr : "0123456789QMSaas";
		var key = CryptoJS.enc.Utf8.parse(keyStr); //Latin1 w8m31+Yy/Nw6thPsMpO5fg==
		var srcs = CryptoJS.enc.Utf8.parse(word);
		var encrypted = CryptoJS.AES.encrypt(srcs, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		return encrypted.toString();
	}
	//解密
	this.decrypt = function (word, keyStr) {
		keyStr = keyStr ? keyStr : "0123456789QMSaas";
		var key = CryptoJS.enc.Utf8.parse(keyStr); //Latin1 w8m31+Yy/Nw6thPsMpO5fg==
		var decrypt = CryptoJS.AES.decrypt(word, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		});
		return CryptoJS.enc.Utf8.stringify(decrypt).toString();
	}

	this.timeStamp = function () {
		return parseInt(new Date().getTime() / 1000);
	}

	/**碰撞检测
	 * 传入A中心点和A的宽、高
	 * B的中心点和B的宽、高
	 */
	this.isCollision = function (A, aW, aH, B, bW, bH) {
		let noCol = false;
		if (Math.abs(A.x - B.x) < (aW + bW) / 2 && Math.abs(A.y - B.y) < (aH + bH) / 2) {
			noCol = true;
		}
		return noCol;
	}
	this.changeParkToString = function (area) {
		let areaArr = [];
		for (let i = 0; i < area.hasLines.length; i++) {
			let line = area.hasLines[i];
			let array = [];
			array.push(line.startPoint.x, line.startPoint.y, line.endPoint.x, line.endPoint.y);
			areaArr.push(array);
		}
		return areaArr;
	}
	this.changeAreaToString = function (area) {
		let areaArr = [];
		for (let i = 0; i < area.hasLines.length; i++) {
			let line = area.hasLines[i];
			let array = [];
			if (line.isStrLine) {
				array.push(line.startPoint.x, line.startPoint.y, line.endPoint.x, line.endPoint.y);
			} else {
				array.push(line.startPoint.x, line.startPoint.y, line.ctrlPoint1.x, line.ctrlPoint1.y, line.ctrlPoint2.x, line.ctrlPoint2.y, line.endPoint.x, line.endPoint.y);
			}
			areaArr.push(array);
		}
		return areaArr;
	}
	this.changeWallToString = function (area) {
		let areaArr = [];
		let points = Config.getWallPoints(area.pathPoints,area.thick);
		for (let i = 0; i < points.length; i++) {
			let array = [];
			let pend = i==points.length-1 ? points[0] : points[i+1];
			array.push(points[i].x, points[i].y, pend.x, pend.y);
			areaArr.push(array);
		}
		return areaArr;
	}
	//检测区域是否在矩形内
	this.checkAreaInRect = function(area,rect) {
		let ptPolygon = [];
		ptPolygon.push(rect[0], new Config.Point(rect[1].x,rect[0].y), rect[1], new Config.Point(rect[0].x,rect[1].y));
		for (let f = 0; f < area.hasLines.length; f++) {
			let line2 = area.hasLines[f];
			let sPoint = Config.checkBoundary(new Config.Point(line2.startPoint.x,line2.startPoint.y),ptPolygon);
			let ePoint = Config.checkBoundary(new Config.Point(line2.endPoint.x,line2.endPoint.y),ptPolygon);
			if(!sPoint || !ePoint){
				return false;
			}
		}
		return true;
	}

	//根据配置参数转换店铺圆角
	this.changeShopLinesToString = function (area) {
		let areaStr = [];
		let lines = [];
		for (let m = 0; m < area.hasLines.length; m++) {
			let sPoint, ePoint, cPoint1, cPoint2;
			sPoint = new Config.Point(area.hasLines[m].startPoint.x, area.hasLines[m].startPoint.y);
			ePoint = new Config.Point(area.hasLines[m].endPoint.x, area.hasLines[m].endPoint.y);
			if (area.hasLines[m].isStrLine) {
				cPoint1 = null;
				cPoint2 = null;
			} else {
				cPoint1 = new Config.Point(area.hasLines[m].ctrlPoint1.x, area.hasLines[m].ctrlPoint1.y);
				cPoint2 = new Config.Point(area.hasLines[m].ctrlPoint2.x, area.hasLines[m].ctrlPoint2.y);
			}
			let line = new QM_Line_Father(sPoint, ePoint, cPoint1, cPoint2, area.hasLines[m].isStrLine);
			lines.push(line);
		}

		for (let i = 0; i < lines.length; i++) {
			let line0 = lines[i];
			let line1 = (i < lines.length - 1) ? lines[i + 1] : lines[0];
			if (Config.angleRadius>2) {
				if (line0.isStrLine && line1.isStrLine && Math.abs(line0.endPoint.x - line0.startPoint.x)  + Math.abs(line0.endPoint.y - line0.startPoint.y) > parseInt(Config.angleRadius)*2) {
					let x1 = line0.endPoint.x;
					let y1 = line0.endPoint.y;
					let x2 = line0.startPoint.x;
					let y2 = line0.startPoint.y;
					let x3 = line1.endPoint.x;
					let y3 = line1.endPoint.y;
					if(Math.abs((x3 - x1)/(x2 - x1) - (y3 - y1)/(y2 - y1))<0.1){
						let yArr=[];
						yArr.push(line0.startPoint.x , line0.startPoint.y , line0.endPoint.x , line0.endPoint.y);
						areaStr.push(yArr);
						continue;
					}

					let result = Config.getIncircleByLines(x1, y1, x2, y2, x3, y3, Config.angleRadius);
					let bezierResult = Config.getBezier(result.center.x, result.center.y, result.tangencyPoints[0].x, result.tangencyPoints[
						0].y, result.tangencyPoints[1].x, result.tangencyPoints[1].y, x1, y1, Config.angleRadius);

					if (i > 0) {
						let ctrlPoint1, ctrlPoint2, array=[];
						ctrlPoint1 = ctrlPoint2 = new Config.Point(((bezierResult[0].x - line0.startPoint.x) / 2 + line0.startPoint.x) >> 0, ((
							bezierResult[0].y - line0.startPoint.y) / 2 + line0.startPoint.y) >> 0); //控制点
							array.push(line0.startPoint.x, line0.startPoint.y, ctrlPoint1.x, ctrlPoint1.y, ctrlPoint2.x, ctrlPoint2.y, bezierResult[0].x, bezierResult[0].y );
							areaStr.push(array);
					} else {
						lines[0].endPoint.x = bezierResult[0].x;
						lines[0].endPoint.y = bezierResult[0].y;
					}
					let arr=[];
					arr.push(bezierResult[0].x , bezierResult[0].y, bezierResult[1].x, bezierResult[1].y, bezierResult[2].x, bezierResult[2].y, bezierResult[3].x, bezierResult[3].y);
					areaStr.push(arr);
					line1.startPoint.x = bezierResult[3].x;
					line1.startPoint.y = bezierResult[3].y;
				} else {   /////////////////////////////
					if (i != 0) {
						let pArr=[];
						if (line0.isStrLine) {
							pArr.push(line0.startPoint.x, line0.startPoint.y, line0.endPoint.x, line0.endPoint.y);
						} else {
							pArr.push(line0.startPoint.x, line0.startPoint.y, line0.ctrlPoint1.x, line0.ctrlPoint1.y, line0.ctrlPoint2.x, line0.ctrlPoint2.y, line0.endPoint.x, line0.endPoint.y);
						}
						areaStr.push(pArr);
					}
				}
				if (i == lines.length - 1) {
					let ocPoint1, ocPoint2,oArr=[];
					if (line1.isStrLine) {
						oArr.push(line1.startPoint.x, line1.startPoint.y, line1.endPoint.x, line1.endPoint.y);
					} else {
						ocPoint1 = new Config.Point(line1.ctrlPoint1.x, line1.ctrlPoint1.y);
						ocPoint2 = new Config.Point(line1.ctrlPoint2.x, line1.ctrlPoint2.y);
						oArr.push(line1.startPoint.x, line1.startPoint.y , ocPoint1.x, ocPoint1.y, ocPoint2.x, ocPoint2.y, line1.endPoint.x , line1.endPoint.y);
					}
					areaStr.push(oArr);
				}
			} else {
				let yArr=[];
				if (line0.isStrLine) {
					yArr.push(line0.startPoint.x , line0.startPoint.y , line0.endPoint.x , line0.endPoint.y);
				} else {
					yArr.push(line0.startPoint.x , line0.startPoint.y , line0.ctrlPoint1.x , line0.ctrlPoint1.y , line0.ctrlPoint2.x , line0.ctrlPoint2.y, line0.endPoint.x, line0.endPoint.y);
				}
				areaStr.push(yArr);
			}
		}
		return areaStr;
	}

	//根据圆心、两个切点、切点相交线顶点和半径 计算三次贝塞尔曲线的控制点
	this.getBezier = function (x1, y1, x2, y2, x3, y3, x4, y4, radius) {
		//切线向量A
		var vectorAx = x2 - x1;
		var vectorAy = y2 - y1;
		//切线向量B
		var vectorBx = x3 - x1;
		var vectorBy = y3 - y1;

		//计算切点和圆形组成相交线的夹角
		var angle = Math.acos((vectorAx * vectorBx + vectorAy * vectorBy) / (Math.sqrt(vectorAx * vectorAx + vectorAy *
			vectorAy) * Math.sqrt(vectorBx * vectorBx + vectorBy * vectorBy)));
		//计算切点到控制点的距离
		var tempDistence = 4 / 3 * radius * Math.tan(angle / 4);
		return [{
			"x": x2,
			"y": y2
		}, Config.getPointFromLine(x2, y2, x4, y4, tempDistence), Config.getPointFromLine(x3, y3, x4, y4, tempDistence), {
			"x": x3,
			"y": y3
		}];
	}
	//根据半径计算两条线段相切圆的圆心和切点坐标
	this.getIncircleByLines = function (x1, y1, x2, y2, x3, y3, radius) {
		//向量夹角
		let angle = Config.getVectorAngle(x2 - x1, y2 - y1, x3 - x1, y3 - y1);
		angle = ((angle > 180) ? 360 - angle : angle) / 2;
		//根据夹角计算侧边切点相对于顶点距离
		let distance = radius / Math.tan(Math.PI * angle / 180);
		//计算侧边相切点具体坐标
		let tangencyPoints = [Config.getPointFromLine(x1, y1, x2, y2, distance), Config.getPointFromLine(x1, y1, x3, y3,
			distance)];

		let centerX, centerY;
		let areaSize = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
		//计算圆心坐标
		if (areaSize < 0) {
			centerX = (tangencyPoints[0].x * (1 / Math.tan(Math.PI * angle / 180)) + tangencyPoints[0].y - y1) / (1 / Math.tan(
				Math.PI * angle / 180));
			centerY = (tangencyPoints[0].y * (1 / Math.tan(Math.PI * angle / 180)) + x1 - tangencyPoints[0].x) / (1 / Math.tan(
				Math.PI * angle / 180));
		} else {
			centerX = (tangencyPoints[1].x * (1 / Math.tan(Math.PI * angle / 180)) + tangencyPoints[1].y - y1) / (1 / Math.tan(
				Math.PI * angle / 180));
			centerY = (tangencyPoints[1].y * (1 / Math.tan(Math.PI * angle / 180)) + x1 - tangencyPoints[1].x) / (1 / Math.tan(
				Math.PI * angle / 180));
		}
		return {
			"center": {
				"x": centerX,
				"y": centerY
			},
			"tangencyPoints": tangencyPoints,
			"angle": Math.PI * angle / 90
		};
	}

	//根据距离计算线段上某一点的具体坐标
	this.getPointFromLine = function (startX, startY, endX, endY, distance) {
		if (startX == endX) return {
			"x": startX,
			"y": startY < endY ? (startY + distance) : (startY - distance)
		};

		let k = (startY - endY) * 1.0 / (startX - endX);
		let b = startY - k * startX;
		let A = Math.pow(k, 2) + 1;
		let B = 2 * ((b - startY) * k - startX);
		let C = Math.pow(b - startY, 2) + Math.pow(startX, 2) - Math.pow(distance, 2);
		let x1 = (-B + Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
		let x2 = (-B - Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
		let x = 0;

		if (x1 == x2) x = x1;
		else if (startX <= x1 && x1 <= endX || endX <= x1 && x1 <= startX) x = x1;
		else if (startX <= x2 && x2 <= endX || endX <= x2 && x2 <= startX) x = x2;

		let y = k * x + b;
		return {
			"x": x,
			"y": y
		};
	}

	//计算两个向量之间的夹角
	this.getVectorAngle = function (x1, y1, x2, y2) {
		let epsilon = 1.0e-6;
		let dist, dot, degree, angle;
		dist = Math.sqrt(x1 * x1 + y1 * y1);
		x1 /= dist;
		y1 /= dist;
		dist = Math.sqrt(x2 * x2 + y2 * y2);
		x2 /= dist;
		y2 /= dist;
		dot = x1 * x2 + y1 * y2;
		if (Math.abs(dot - 1.0) <= epsilon) angle = 0;
		else if (Math.abs(dot + 1.0) <= epsilon) angle = Math.PI;
		else {
			angle = Math.acos(dot);
			let cross = x1 * y2 - x2 * y1;
			if (cross < 0) angle = 2 * Math.PI - angle;
		}
		degree = angle * 180 / Math.PI;
		return degree;
	}
	//检测区域是否在区域内  true  (area2包含area)
	this.checkAreaInArea = function (area, area2) {
		let ptPolygon = [];
		for (let i = 0; i < area2.hasLines.length; i++) {
			let line = area2.hasLines[i];
			let pArr;
			if (line.isStrLine) {
				pArr = Config.getPointArrOnLine(line.startPoint, line.endPoint);
			} else {
				pArr = Config.getPointArr(line.startPoint, line.ctrlPoint1, line.ctrlPoint2, line.endPoint, 0.1);
			}
			ptPolygon.push(...pArr);
		}
		for (let f = 0; f < area.hasLines.length; f++) {
			let line2 = area.hasLines[f];
			let sPoint = Config.checkBoundary(new Config.Point(line2.startPoint.x, line2.startPoint.y), ptPolygon);
			let ePoint = Config.checkBoundary(new Config.Point(line2.endPoint.x, line2.endPoint.y), ptPolygon);
			if (!sPoint || !ePoint) {
				return false;
			}
		}
		return true;
	}

	this.getPointListByArea = function (area) {
		let pointArr = [];
		for (let m = 0; m < area.hasLines.length; m++) {
			let line = area.hasLines[m];
			pointArr.push(line.startPoint, line.endPoint);
		}
		return pointArr;
	}

	/**
	 * 返回取得点的数组
	 * s1--起点  s2 --终点   s3,s4 --控制点
	 */
	this.getPointArr = function (s1, s3, s4, s2, sp = 0.01) {
		let pArr = [];
		let sz = [s1, s3, s4, s2];
		let p = Config.P_BEZ(0, sz);
		for (let j = 0; j < 1; j += sp) {
			p = Config.P_BEZ(j, sz);
			pArr.push(p);
		}
		return pArr;
	}

	this.P_BEZ = function (t, sz) { //n次
		let x_p = 0;
		let y_p = 0;
		let n = sz.length;
		for (let i = 0; i < sz.length; i++) {
			let son = Config.jie_cheng(n - 1);
			let mother = Config.jie_cheng(i) * Config.jie_cheng(n - 1 - i);
			let b = (son / mother) * Math.pow(t, i) * Math.pow(1 - t, n - 1 - i);
			x_p += sz[i].x * b;
			y_p += sz[i].y * b;
		}

		x_p = Number(x_p * 1000) / 1000;
		y_p = Number(y_p * 1000) / 1000;
		return (new Config.Point(x_p, y_p));
	}

	this.jie_cheng = function (i) { //阶乘
		let n = 1;
		for (let j = 1; j <= i; j++) {
			n *= j;
		}
		return n;
	}

	this.checkPointLiePath = function(point){
		let pathArea =  Config.allMap[Config.numBuild].buildArr[Config.numFloor].mapData.path;
		if(!pathArea){
			pathArea =  Config.allMap[Config.numBuild].buildArr[Config.numFloor].mapData.path = new QM_PathLine();
		}
		for(let i=0;i<pathArea.nodes.length;i++){
			for(let j=0;j<pathArea.nodes[i].list.length;j++){
				let getPoints = Config.getPointArrOnLine(pathArea.nodes[i].list[j].selfNode,pathArea.nodes[i].list[j].nextNode);
				for(let k=0; k<getPoints.length; k++){
					if(Math.abs(getPoints[k].x-point.x)<5 && Math.abs(getPoints[k].y-point.y)<5){
						return {"line":pathArea.nodes[i].list[j],"point":getPoints[k]};
					}
				}
			}
		}
		return null;
	}
	this.deleteAssist=function(assistObj){
		for(let i=0;i<Config.assistPoint.length;i++){
			if(assistObj == Config.assistPoint[i]){
				Config.assistPoint.splice(i,1);
			}
		}
	}


	/**
	 * 获取线段上的所有点
	 */
	this.getPointArrOnLine = function (s1, s2) {
		let points = [];
		if (s1.x == s2.x) {
			let vy = s1.y < s2.y ? 1 : -1;
			for (let m = 1; m < Math.abs(s1.y - s2.y); m++) {
				let y0 = s1.y + (m * vy);
				let x0 = s1.x;
				points.push(new Config.Point(x0, y0));
			}
			return points;
		}
		let k = (s1.y - s2.y) / (s1.x - s2.x);  // 坐标直线斜率k
		let b = s1.y - k * s1.x;  // 坐标直线b
		if (Math.abs(s1.x - s2.x) > Math.abs(s1.y - s2.y)) {
			let vx = s1.x < s2.x ? 1 : -1;
			for (let i = 1; i < Math.abs(s1.x - s2.x); i++) {
				let x0 = s1.x + (i * vx);
				let y0 = k * x0 + b;
				points.push(new Config.Point(x0, y0));
			}
		} else {
			let vy = s1.y < s2.y ? 1 : -1;
			for (let n = 1; n < Math.abs(s1.y - s2.y); n++) {
				let y0 = s1.y + (n * vy);
				let x0 = (y0 - b) / k;
				points.push(new Config.Point(x0, y0));
			}
		}
		return points;
	}


	// ptStart: 圆上某点(初始点);
	// ptCenter: 圆心点;
	// angle: 旋转角度°  -- [angle * M_PI / 180]:将角度换算为弧度
	// 【注意】angle 逆时针为正，顺时针为负
	this.RotatePoint = function (ptStart, ptCenter, angle) {
		//其中圆心（a,b),  圆上一点坐标(x0,y0), 旋转角度α,
		//那么旋转后的坐标 x=a+(x0-a)cosα-(y0-b)sinα ,    y=b+(x0-a)sinα+(y0-b)cosα
		let rx = ptCenter.x + (ptStart.x - ptCenter.x) * Math.cos(angle) - (ptStart.y - ptCenter.y) * Math.sin(angle);
		let ry = ptCenter.y + (ptStart.x - ptCenter.x) * Math.sin(angle) + (ptStart.y - ptCenter.y) * Math.cos(angle);
		return { "x": rx, "y": ry };
	}
	//获取鼠标拖拽移动的角度
	this.getDragAngle = function (event, thisArea) {
		if (thisArea) {
			let startAngle = parseFloat(thisArea.angle) || 0;
			let center = {
				x: thisArea.xaxis,
				y: thisArea.yaxis,
			};
			let angle = Math.atan2(center.y - event.clientY, center.x - event.clientX);
			thisArea.angle = angle;
			return angle - startAngle;
		}
	}
	/**
	 * @param {Object} fromPoint
	 * @param {Object} toPoint
	 * @param {Object} centerPoint
	 *  求已知三点的夹角(起始点，结束点，中间点)
	 */
	this.getSlopWithCoord = function (toPoint, centerPoint) {
		let angle = Math.atan2(toPoint.y - centerPoint.y, toPoint.x - centerPoint.x);
		return angle;
	}
	/** 计算多边形面积
	 * @param  points 点数组
	 */
	this.computePolygonArea = function (area) {
		let points = [];
		for (let m = 0; m < area.hasLines.length; m++) {
			let line = area.hasLines[m];
			let pArr;
			if (line.isStrLine) {
				pArr = Config.getPointArrOnLine(line.startPoint, line.endPoint);
			} else {
				pArr = Config.getPointArr(line.startPoint, line.ctrlPoint1, line.ctrlPoint2, line.endPoint, 0.1);
			}
			points.push(...pArr);
		}
		let point_num = points.length;
		if (point_num < 3) {
			return 0;
		}
		let s = points[0].y * (points[point_num - 1].x - points[1].x);
		for (let i = 1; i < point_num; ++i) {
			s += points[i].y * (points[i - 1].x - points[(i + 1) % point_num].x);
		}
		return Math.round(Math.abs(s / 2) / Config.scale_blc);
	}

	/**
	 * @param {Object} centerPoint
	 * @param {Object} r
	 * @param {Object} angle
	 * 通过角度获取圆上点
	 */
	this.getPointWithArc = function (centerPoint, r, angle) {
		let x1 = centerPoint.x + r * Math.cos(angle);
		let y1 = centerPoint.y + r * Math.sin(angle);
		return new Config.Point(x1, y1);
	}
	//转换公共设施type值
	this.getFacType = function (str) {
		let typeObj = { ft: 0, mys: 3, xsj: 4, dt: 5, fwt: 7, tcc: 8, cjr: 10, xys: 11, dit: 21, czc: 22, atm: 23, jcfw: 24, sjcd: 25, bc: 26, cjc: 27, jtn: 28, jtv: 29, ksgj: 30, sjxsn: 31, sjxsv: 32, tcjf: 33, vip: 34, xsjn: 35, xsjv: 36, yszj: 37, xxt: 38, door: 39, pq: 40, upft:0, downft:0, ysp: 50, lt: 88 };
		return typeObj[str];
	}

	this.isToFloor = function (hasFloor, floor) {
		if (hasFloor.search(floor) != -1) {
			return true;
		}
		return false;
	}
	this.sortNode = function (a, b) {
		return a.id - b.id
	}

	/**该方法用来绘制一个圆角矩形
*@param cxt:canvas的上下文环境
*@param x:左上角x轴坐标
*@param y:左上角y轴坐标
*@param width:矩形的宽度
*@param height:矩形的高度
*@param radius:圆的半径
**/
	this.drawRoundRectPath = function (cxt, width, height, radius) {
		cxt.beginPath(0);
		//从右下角顺时针绘制，弧度从0到1/2PI
		cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
		//矩形下边线
		cxt.lineTo(radius, height);
		//左下角圆弧，弧度从1/2PI到PI
		cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
		//矩形左边线
		cxt.lineTo(0, radius);
		//左上角圆弧，弧度从PI到3/2PI
		cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
		//上边线
		cxt.lineTo(width - radius, 0);
		//右上角圆弧
		cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
		//右边线
		cxt.lineTo(width, height - radius);
		cxt.closePath();
	}

	this.wordToSreen = function (world_vector) {
		let vector = world_vector.project(Map_QM.camera);
		let halfWidth = window.innerWidth / 2, halfHeight = window.innerHeight / 2;
		return {
			x: Math.round(vector.x * halfWidth + halfWidth),
			y: Math.round(-vector.y * halfHeight + halfHeight)
		};
	}
	////////////////////////////////////////////////////////////////////////////////////////////
	this.getWallPoints = function (points, wallWidth) {

		if (points.length < 2) {
			console.log("getWallPoints", "points size is letter than 2");
			return new Array();
		}
		//构建线段列表
		let lines = new Array();
		for (let index = 0; index < points.length - 1; index++) {
			let startPoint = points[index];
			let endPoint = points[index + 1];
			let line = (Config.getParallelLine(startPoint, endPoint, wallWidth));
			lines.push(line);
		}
		//生成线段对应的左右两侧平行线
		for (let index = 0; index < lines.length - 1; index++) {
			let start = lines[index];
			let end = lines[index + 1];
			if (start.leftParLine != null && start.rightParLine != null && end.leftParLine != null && end.rightParLine != null) {
				start.leftPoint = Config.getIntersectionByLines(start.leftParLine, end.leftParLine);
				start.rightPoint = Config.getIntersectionByLines(start.rightParLine, end.rightParLine);
			}
		}
		//循环线段列表 获取墙体所有点位 顺序为 左侧起始点->左侧所有交点->左侧结束点->右侧结束点->右侧所有交点->右侧起始点
		let leftPointList = new Array();
		let rightPointList = new Array();
		for (let index = 0; index < lines.length; index++) {
			//第一条线段 记录左右两侧平行线的起点坐标
			if (index == 0) {
				leftPointList.push(lines[index].leftParLine.start);
				rightPointList.push(lines[index].rightParLine.start);
			}
			//最后一条线段 记录左右两侧平行线的终点坐标
			if (index == lines.length - 1) {
				leftPointList.push(lines[index].leftParLine.end);
				rightPointList.push(lines[index].rightParLine.end);
			} else {//记录线段左右平行线交点坐标
				leftPointList.push(lines[index].leftPoint);
				rightPointList.push(lines[index].rightPoint);
			}
		}
		rightPointList.reverse();
		return leftPointList.concat(rightPointList);
	}

	//生成线段左右两侧的平行线
	this.getParallelLine = function (start, end, wallWidth) {
		let line = new Config.WallLine(start, end);
		//计算当前线段的斜率
		let gradient = (start.y - end.y) / (start.x - end.x);
		//计算垂直线的斜率
		let perGradient = -1 / gradient;
		//获取垂直线上左右两侧 与当前点位相距一定距离的两个定点
		let startResult = Config.getParallelPoints(perGradient, start, wallWidth);
		let endResult = Config.getParallelPoints(perGradient, end, wallWidth);
		let x1 = startResult[0].x;
		let y1 = startResult[0].y;
		let x2 = endResult[0].x;
		let y2 = endResult[0].y;
		let x3 = end.x;
		let y3 = end.y;
		let x4 = startResult[1].x;
		let y4 = startResult[1].y;
		let x5 = endResult[1].x;
		let y5 = endResult[1].y;
		let s = (x1 - x3) * (y2 - y3) - (y1 - y3) * (x2 - x3);
		//判断点位位于线段的左侧还是右侧
		if (s > 0) {
			line.leftParLine = new Config.WallLine(new Config.Point(x1, y1), new Config.Point(x2, y2));
			line.rightParLine = new Config.WallLine(new Config.Point(x4, y4), new Config.Point(x5, y5));
		} else if (s < 0) {
			line.leftParLine = new Config.WallLine(new Config.Point(x4, y4), new Config.Point(x5, y5));
			line.rightParLine = new Config.WallLine(new Config.Point(x1, y1), new Config.Point(x2, y2));
		}
		return line;
	}

	// 生成线段起始 和 结束 点位 对应的 两条 与线段垂直的直线 并记录坐标
	this.getParallelPoints = function (gradient, point, wallWidth) {
		let x, y;
		//斜率为无穷大时 计算不了垂直线 指定点位
		if (gradient == Number.NEGATIVE_INFINITY || gradient == Number.POSITIVE_INFINITY) {
			x = point.x;
			y = point.y + 5;
		} else {
			//不是横线时 根据斜率计算点位
			x = point.x + 5;
			y = parseInt(gradient * (x - point.x) + point.y);
		}

		return Config.pointXY(point, new Config.Point(x, y), wallWidth / 2);
	}

	// 获取点位在直线上的坐标
	this.pointXY = function (curPoint, nextPoint, length) {
		let result = new Array();
		//x值相等 说明是竖线 只需增减y轴坐标
		if (curPoint.x == nextPoint.x) {
			result.push(new Config.Point(curPoint.x, curPoint.y + length));
			result.push(new Config.Point(curPoint.x, curPoint.y - length));
			return result;
		}
		//根据 斜率 和 距离 计算出对应的两个点位
		let k = (curPoint.y - nextPoint.y) / (curPoint.x - nextPoint.x);
		let b = curPoint.y - k * curPoint.x;
		let A = Math.pow(k, 2) + 1;
		let B = 2 * ((b - curPoint.y) * k - curPoint.x);
		let C = Math.pow(b - curPoint.y, 2) + Math.pow(curPoint.x, 2) - Math.pow(length, 2);
		let x1 = (-B + Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
		let x2 = (-B - Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);

		result.push(new Config.Point(parseInt(x1), parseInt(k * x1 + b)));
		result.push(new Config.Point(parseInt(x2), parseInt(k * x2 + b)));
		return result;
	}

	//计算两条直线的相交点
	this.getIntersectionByLines = function (line1, line2) {
		//直线斜率
		let gradient1 = (line1.end.y - line1.start.y) / (line1.end.x - line1.start.x);
		let gradient2 = (line2.end.y - line2.start.y) / (line2.end.x - line2.start.x);
		//斜率差值小于一定范围 表示两条线近似平行 因为交点太远 可能超出屏幕  直接取线段中点为交点
		if (Math.abs(gradient1 - gradient2) < 0.1) return new Config.Point(line1.end.x, line1.end.y);
		let x1 = line1.start.x;
		let y1 = line1.start.y;
		let x2 = line1.end.x;
		let y2 = line1.end.y;
		let x3 = line2.start.x;
		let y3 = line2.start.y;
		let x4 = line2.end.x;
		let y4 = line2.end.y;

		//计算交点坐标
		let x = ((x1 - x2) * (x3 * y4 - x4 * y3) - (x3 - x4) * (x1 * y2 - x2 * y1)) / ((x3 - x4) * (y1 - y2) - (x1 - x2) * (y3 - y4));
		let y = ((y1 - y2) * (x3 * y4 - x4 * y3) - (x1 * y2 - x2 * y1) * (y3 - y4)) / ((y1 - y2) * (x3 - x4) - (x1 - x2) * (y3 - y4));
		return new Config.Point(x, y);
	}
//计算点到线段的距离
	this.PointToLineDistance = function (xx, yy, x1, y1, x2, y2) {
		let ang1, ang2, ang, m;
		let result = 0;
		// 分别计算三条边的长度
		const a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
		if (a === 0) {
			return [0, {x: x1,y: y1}];
		}
		const b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
		if (b === 0) {
			return [0, {x: x2,y: y2}];
		}
		const c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		// 如果线段是一个点则退出函数并返回距离
		if (c === 0) {
			result = a;
			return [result, {x: x1,y: y1}];
		}
		// 如果点(xx,yy到点x1,y1)这条边短
		if (a < b) {
			// 如果直线段AB是水平线。得到直线段AB的弧度
			if (y1 === y2) {
				if (x1 < x2) {
					ang1 = 0;
				} else {
					ang1 = Math.PI;
				}
			} else {
				m = (x2 - x1) / c;
				if (m - 1 > 0.00001) {
					m = 1;
				}
				ang1 = Math.acos(m);
				if (y1 > y2) {
					ang1 = Math.PI * 2 - ang1;
				}// 直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
			}
			m = (xx - x1) / a;
			if (m - 1 > 0.00001) {
				m = 1;
			}
			ang2 = Math.acos(m);
			if (y1 > yy) {
				ang2 = Math.PI * 2 - ang2;
			}// 直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度
			ang = ang2 - ang1;
			if (ang < 0) {
				ang = -ang;
			}
			if (ang > Math.PI) {
				ang = Math.PI * 2 - ang;
			}
			// 如果是钝角则直接返回距离
			if (ang > Math.PI / 2) {
				return [a, {x: x1,y: y1}];
			}
			// 返回距离并且求得当前距离所在线段的坐标
			if (x1 === x2) {
				return [b * Math.sin(ang), {x: x1,y: yy}];
			} else if (y1 === y2) {
				return [b * Math.sin(ang), {x: xx,y: y1}];
			}
			// 直线的斜率存在且不为0的情况下
			let x = 0,y = 0;
			const k1 = ((y2 - y1) / x2 - x1);
			const kk = -1 / k1;
			const bb = yy - xx * kk;
			const b1 = y2 - x2 * k1;
			x = (b1 - bb) / (kk - k1);
			y = kk * x + bb;
			return [a * Math.sin(ang), {x,y}];
		}
		// 如果两个点的纵坐标相同，则直接得到直线斜率的弧度
		if (y1 === y2) {
			if (x1 < x2) {
				ang1 = Math.PI;
			} else {
				ang1 = 0;
			}
		} else {
			m = (x1 - x2) / c;
			if (m - 1 > 0.00001) {
				m = 1;
			}
			ang1 = Math.acos(m);
			if (y2 > y1) {
				ang1 = Math.PI * 2 - ang1;
			}
		}
		m = (xx - x2) / b;
		if (m - 1 > 0.00001) {
			m = 1;
		}
		ang2 = Math.acos(m);// 直线(x2-x1)-(xx,yy)斜率的弧度
		if (y2 > yy) {
			ang2 = Math.PI * 2 - ang2;
		}
		ang = ang2 - ang1;
		if (ang < 0) {
			ang = -ang;
		}
		if (ang > Math.PI) {
			ang = Math.PI * 2 - ang;
		}// 交角的大小
		// 如果是对角则直接返回距离
		if (ang > Math.PI / 2) {
			return [b, {x: x2,y: y2}];
		}
		// 如果是锐角，返回计算得到的距离,并计算出相应的坐标
		if (x1 === x2) {
			return [b * Math.sin(ang), {x: x1,y: yy}];
		} else if (y1 === y2) {
			return [b * Math.sin(ang), {x: xx,y: y1}];
		}
		// 直线的斜率存在且不为0的情况下
		let x = 0,y = 0;
		const k1 = ((y2 - y1) / x2 - x1);
		const kk = -1 / k1;
		const bb = yy - xx * kk;
		const b1 = y2 - x2 * k1;
		x = (b1 - bb) / (kk - k1);
		y = kk * x + bb;
		return [b * Math.sin(ang), {x,y}];
	}
//点到直线距离
	this.PointToLineDis = function (xx, yy, x1, y1, x2, y2) {
		let len;
    	if(x1-x2==0){
			len=Math.abs(xx-x1);
    	}else {
        	let A=(y1-y2)/(x1-x2);
        	let B=y1-A*x1;
        	len=Math.abs((A*xx+B-yy)/Math.sqrt(A*A+1))
   	 	}
		return len;
	}

	////////////////////////////////////////////////////////////////////////////---------------------------end

	/**
	 * 撤销保存
		*/
	this.cloneMapData = function (fromData) {
		console.log("保存数据");
		let mapData = {
			floorArea: null,
			buildArea: [],
			hollowArea: [],
			shopArea: [],
			path: null,
			decos: [],
			icons: [],
			stairs: [],
			parkArea: [],
			devices:[],
			wallArea:[]
		};
		mapData.icons = fromData.icons;
		mapData.stairs = fromData.stairs;
		mapData.devices = fromData.devices;

		if (fromData.floorArea) {
			mapData.floorArea = new QM_Area(fromData.floorArea.name);
			mapData.floorArea.initFromServe(fromData.floorArea);
		}

		for (let i = 0; i < fromData.buildArea.length; i++) {
			mapData.buildArea[i] = new QM_Area(fromData.buildArea[i].name);
			mapData.buildArea[i].initFromServe(fromData.buildArea[i]);
		}

		for (let j = 0; j < fromData.hollowArea.length; j++) {
			mapData.hollowArea[j] = new QM_Area(fromData.hollowArea[j].name);
			mapData.hollowArea[j].initFromServe(fromData.hollowArea[j]);
		}
		for (let k = 0; k < fromData.shopArea.length; k++) {
			mapData.shopArea[k] = new QM_Area(fromData.shopArea[k].name);
			mapData.shopArea[k].initFromServe(fromData.shopArea[k]);
		}
		for (let l = 0; l < fromData.decos.length; l++) {
			mapData.decos[l] = new QM_Area(fromData.decos[l].name);
			mapData.decos[l].initFromServe(fromData.decos[l]);
		}
		for (let g = 0; g < fromData.parkArea.length; g++) {
			mapData.parkArea[g] = new QM_Park(fromData.parkArea[g].name);
			mapData.parkArea[g].initFromServe(fromData.parkArea[g]);
		}
		if(fromData.wallArea){
			for (let g = 0; g < fromData.wallArea.length; g++) {
				mapData.wallArea[g] = new QM_Wall(fromData.wallArea[g].name);
				mapData.wallArea[g].initFromServe(fromData.wallArea[g]);
			}
		}
		if(fromData.path && Config.mapState=="path"){
			mapData.path = new QM_PathLine();
			mapData.path.initFromServe(fromData.path);
		}else{
			mapData.path = fromData.path;
		}

		return mapData;
	}
	//更新全局所有区域点de 数组
	this.updatePointList = function () {
		QM_PointList.length = 0;
		let mapData = Config.allMap[Config.numBuild].buildArr[Config.numFloor].mapData;
		if (mapData.floorArea) {
			let fPoints = Config.getPointListByArea(mapData.floorArea);
			QM_PointList = QM_PointList.concat(fPoints);
		}
		for (let i = 0; i < mapData.hollowArea.length; i++) {
			let bPoints = Config.getPointListByArea(mapData.hollowArea[i]);
			QM_PointList = QM_PointList.concat(bPoints);
		}
		for (let i = 0; i < mapData.buildArea.length; i++) {
			if(!mapData.buildArea[i].isSelect){
				let bPoints = Config.getPointListByArea(mapData.buildArea[i]);
				QM_PointList = QM_PointList.concat(bPoints);
			}
		}
		if (Config.mapState == "shop") {
			for (let k = 0; k < mapData.shopArea.length; k++) {
				if(!mapData.shopArea[k].isSelect){
					let sPoints = Config.getPointListByArea(mapData.shopArea[k]);
					QM_PointList = QM_PointList.concat(sPoints);
				}
			}
		}
		if(mapData.wallArea){
			for (let g = 0; g < mapData.wallArea.length; g++) {
				if(!mapData.wallArea[g].isSelect){
					let sPoints = mapData.wallArea[g].getAllPoint();
					QM_PointList = QM_PointList.concat(sPoints);
					QM_PointList = QM_PointList.concat(mapData.wallArea[g].pathPoints);
				}
			}
		}
	}

	/**
	 * 根据色值获取材质
	 */
	this.getMeshMaterial = function (color, alphaModle = 0.9) {
		let meshMaterial;
		for (let k = 0; k < Config.meshMaterialArr.length; k++) {
			let color2 = new THREE.Color(color)
			if (Config.meshMaterialArr[k].color.equals(color2) && Config.meshMaterialArr[k].opacity == alphaModle) {
				meshMaterial = Config.meshMaterialArr[k];
			}
		}
		if (!meshMaterial) {
			meshMaterial = new THREE.MeshPhongMaterial({
				color: color,
				emissive: 0x000000,
				specular: 0x000000,
				transparent: true,
				side: THREE.DoubleSide,
				opacity: alphaModle
			});
			Config.meshMaterialArr.push(meshMaterial);
		}
		return meshMaterial;
	}
}
const Config = new ConfigFun();
