FloorMap_QM = function () {
	this.Model_QM = new MyModel_QM();
	this.facUtil = new Facilities_QM();
	this.allObj = new THREE.Object3D();
	this.allObj.rotation.x = Math.PI / -2;
	this.labelObj = new THREE.Group();
	this.labelObj.renderOrder = 100;
	this.allObj.add(this.labelObj);
	this.pathObj =new THREE.Object3D();
	this.allObj.add(this.pathObj);
}

FloorMap_QM.prototype.initDraw = function () {
	this.initFloor();
	this.initPath();
	this.initFacilitie();
	this.initStairs();
	this.initWall();
	this.initDecos();
	this.setStartSite();
}
//初始化单楼层
FloorMap_QM.prototype.initFloor = function () {
	let floor;
	let mapData = mapObj.mapData;
	if (mapData.floorArea) {
		floor = Config.changeAreaToString(mapData.floorArea);
	}
	let bLen = mapData.buildArea.length;
	let hLen = mapData.hollowArea.length;
	let hows_f = [];
	for (let m = 0; m < hLen; m++) {
		hows_f.push(Config.changeAreaToString(mapData.hollowArea[m]));
	}
	if (floor) {
		let entColor = parseInt(mapData.floorArea.entColor.replace("#", "0x"), 16);
		let borderColor = parseInt(mapData.floorArea.borderColor.replace("#", "0x"), 16);
		floorH = parseInt(mapData.floorArea.toHeight);
		let mash = this.Model_QM.MyModelShape(floor, hows_f, mapData.floorArea.name, {
			depth: 2,
			bevelEnabled: false
		}, 0, entColor, borderColor, mapData.floorArea.alphaModle / 100, 10);
		mash.userData = {
			"type": "floor"
		};
		this.allObj.add(mash);
	}
	/////////////////////初始化楼栋
	for (let i = 0; i < bLen; i++) {
		let build = Config.changeAreaToString(mapData.buildArea[i]);
		let hows = [];
		for (let t = 0; t < hLen; t++) {
			let isIn = Config.checkAreaInArea(mapData.hollowArea[t], mapData.buildArea[i]);
			if (isIn) {
				hows.push(Config.changeAreaToString(mapData.hollowArea[t]));
			}
		}
		entColor = parseInt(mapData.buildArea[i].entColor.replace("#", "0x"), 16);
		borderColor = parseInt(mapData.buildArea[i].borderColor.replace("#", "0x"), 16);
		Config.buildHeight = Math.max(parseInt(mapData.buildArea[i].toHeight), Config.buildHeight);
		buildH = parseInt(mapData.buildArea[i].toHeight);
		let mash = this.Model_QM.MyModelShape(build, hows, mapData.buildArea[i].name, {
			depth: 2,
			bevelEnabled: false
		}, 0, entColor, borderColor, mapData.buildArea[i].alphaModle / 100, 30);
		mash.userData = {
			"type": "build"
		};
		this.allObj.add(mash);
	}

	let css = `color: ${Config.pocColor};height: ${parseInt(Config.pocHeight)*0.2}px;
	font-size: ${parseInt(Config.pocHeight)}px; z-index: 90;
	text-shadow: ${Config.pocBorderColor} 1px 0 0, ${Config.pocBorderColor} 0 1px 0, ${Config.pocBorderColor} -1px 0 0, ${Config.pocBorderColor} 0 -1px 0;`;

	//店铺
	let sLen = mapData.shopArea.length;
	for (let i = 0; i < sLen; i++) {
		if (Config.changeAreaToString(mapData.shopArea[i]) != "") {
			let arr = Config.changeShopLinesToString(mapData.shopArea[i]);
			entColor = mapData.shopArea[i].entColor;
			borderColor = mapData.shopArea[i].borderColor;
			let show = mapData.shopArea[i].name;
			Config.shopHeight = parseInt(mapData.shopArea[i].toHeight);
			if (shopData) {
				let shopArr = shopData.shopList;
				for (let k = 0; k < shopArr.length; k++) {
					if (shopArr[k].houseNum == mapData.shopArea[i].name) {
						//show = shopArr[k].name;
						if (mapData.shopArea[i].logoUrl && mapData.shopArea[i].isLabel == 0) { //添加logo
							this.logoUtil.renderIcon(mapData.shopArea[i], this, parseInt(mapData.shopArea[i].toHeight) + 1);
						}
					}
				}	
			}
			show = show == "shop" ? "" : show;
			show = show == "floor" ? "" : show;
			show = show == "build" ? "" : show;
			let shopDiv = document.createElement('div');
			shopDiv.style.cssText = css;
			shopDiv.textContent = show;
			shopDiv.style.marginTop = 0;
			let shopLabel = new THREE.CSS2DObject(shopDiv);
			shopLabel.name = mapData.shopArea[i].name;
			shopLabel.position.set(mapData.shopArea[i].xaxis >> 0, -1 * mapData.shopArea[i].yaxis >> 0, 4);
			this.labelObj.add(shopLabel);

			let mahc = this.Model_QM.MyModelShape(arr, null, mapData.shopArea[i].name, {
				depth: 5,
				bevelEnabled: false
			}, 0, entColor, borderColor, mapData.shopArea[i].alphaModle / 100, i);
			mahc.node = mapData.shopArea[i].shopNav;
			mahc.shopName = show;
			mahc.xaxis = mapData.shopArea[i].xaxis >> 0;
			mahc.yaxis = mapData.shopArea[i].yaxis >> 0;
			this.allObj.add(mahc);
		}
	}
}

//初始化服务图标
FloorMap_QM.prototype.initFacilitie = function () {
	let serArr = mapObj.mapData.icons;
	for (let i = 0; i < serArr.length; i++) {
		this.facUtil.renderIcon(serArr[i], this, "ser", 10);
	}
}

//初始化电梯图标
FloorMap_QM.prototype.initStairs = function () {
	let facArr = mapObj.mapData.stairs;
	for (let i = 0; i < facArr.length; i++) {
		this.facUtil.renderIcon(facArr[i], this, "fac", 10);
	}
}
//初始化路径
FloorMap_QM.prototype.initPath = function (){
	let pathArr = mapObj.mapData.path.nodes;
	for(let i=0;i<pathArr.length;i++){
		let planeGeom = new THREE.PlaneGeometry(48, 48);
		let texture = new THREE.Texture();
		texture.image = Map_QM.createPointCanvas(pathArr[i].id);
		texture.needsUpdate = true;
		let material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide, depthTest: false, transparent: true});
		let plane = new THREE.Mesh(planeGeom, material)
		plane.position.x = pathArr[i].x;
		plane.position.y = -1*pathArr[i].y;
		plane.position.z = 2;
		plane.renderOrder = 210;
		plane.name=pathArr[i].id;
		this.pathObj.add(plane);
	}
}

/**
 * 设置起点
 * @param {Object} startNode
 * @param {Object} endNode
 */
FloorMap_QM.prototype.setStartSite = function() {
	if(!siteIcon){
		let planeGeom = new THREE.PlaneGeometry(120, 120);
		let textu = new THREE.TextureLoader().load("./static/img/site.png");
		let material = new THREE.MeshBasicMaterial({map: textu, side: THREE.DoubleSide, depthTest: false, transparent: true});
		siteIcon = new THREE.Mesh(planeGeom, material)
		siteIcon.center = new THREE.Vector2(0.5, 0.5);
		siteIcon.renderOrder = 208;
		this.allObj.add(siteIcon);
	}
	siteIcon.position.set(deviceSite.x, deviceSite.y, 5);
	siteIcon.rotation.z = deviceSite.angle*Math.PI/-180;
}
//初始化装饰
FloorMap_QM.prototype.initDecos = function () {
	let css_TD = `color: ${Config.pocColor};
	writing-mode: vertical-rl; text-orientation: upright;
	font-size: ${parseInt(Config.pocHeight)}px; animation: hideIndex 1s; z-index: 90; 
	transform-origin:center center;`;

	let css_LR = `color: ${Config.pocColor};height: ${parseInt(Config.pocHeight)+2}px;
	font-size: ${parseInt(Config.pocHeight)}px; animation: hideIndex 1s; z-index: 90; 
	transform-origin:center center;`;

	let mapData = mapObj.mapData;
	let sLen = mapData.decos.length;
	let entColor, borderColor;
	for (let i = 0; i < sLen; i++) {
		if (Config.changeAreaToString(mapData.decos[i]) != "") {
			let arr = Config.changeAreaToString(mapData.decos[i]);
			entColor = parseInt(mapData.decos[i].entColor.replace("#", "0x"), 16);
			borderColor = parseInt(mapData.decos[i].borderColor.replace("#", "0x"), 16);
			let show = mapData.decos[i].name == "deco" ? "" : mapData.decos[i].name;
			let mahc = this.Model_QM.MyModelShape(arr, null, mapData.decos[i].name, {
				depth: parseInt(mapData.decos[i].toHeight),
				bevelEnabled: false
			}, mapData.decos[i].site, entColor, borderColor, mapData.decos[i].alphaModle / 100, i);
			mahc.xaxis = mapData.decos[i].xaxis >> 0;
			mahc.yaxis = mapData.decos[i].yaxis >> 0;
			mahc.node = mapData.decos[i].shopNav;
			if (show != "") {
				let shopDiv = document.createElement('div');
				shopDiv.style.cssText = mapData.decos[i].rangeType=="LR"?css_LR : css_TD;
				shopDiv.textContent = show;
				
				let shopLabel = new THREE.CSS2DObject(shopDiv);
				shopLabel.name = mapData.decos[i].name;
				
				shopLabel.position.set(mapData.decos[i].xaxis, -1 * mapData.decos[i].yaxis >> 0, 10);
				this.labelObj.add(shopLabel);
			}
			this.allObj.add(mahc);
		}
	}
}
/**
 * 渲染墙体
 */
FloorMap_QM.prototype.initWall = function () {
	let mapData = mapObj.mapData;
	//渲染
	if (mapData.wallArea) {
		let sLen = mapData.wallArea.length;
		for (let i = 0; i < sLen; i++) {
			let arr = Config.changeWallToString(mapData.wallArea[i]);
			let mahc = this.Model_QM.MyModelShape(arr, null, mapData.wallArea[i].name, {
				depth: parseInt(mapData.wallArea[i].toHeight),
				bevelEnabled: false
			}, 0, 0xeaeaea, 0xffffff, parseInt(mapData.wallArea[i].alphaModle) / 100, 80);
			mahc.userData = {
				"type":"wall"
			};
			this.allObj.add(mahc);
		}
	}
}
/**
* 渲染3D模型类
* 传入区域点list
* 镂空点  howllowArr
* 名称  name
* 模型对象 options
*/
MyModel_QM = function () {
	this.xaxis = 0;
	this.yaxis = 0;
	this.node = 0;
}
MyModel_QM.prototype.MyModelShape = function (areaArr, howllowArr, name, options, siteH = 0, entityColor = 0xdadada, lineColor = 0xeeeeee, alphaModle = 0.9, indexOrder = 1) {
	let len = areaArr.length;
	if (len == 0) {
		return;
	}
	// 实例化shape对象
	let shape = new THREE.Shape();
	// 设置开始点的位置
	for (let i = 0; i < areaArr.length; i++) {
		shape.moveTo(areaArr[i][0], -1 * areaArr[i][1]);
		if (areaArr[i].length == 4) {
			shape.lineTo(areaArr[i][2], -1 * areaArr[i][3]);
		} else {
			shape.bezierCurveTo(areaArr[i][2], -1 * areaArr[i][3], areaArr[i][4], -1 * areaArr[i][5], areaArr[i][6], -1 * areaArr[i][7]);
		}
	}

	if (howllowArr && howllowArr.length > 0) {
		for (let n = 0; n < howllowArr.length; n++) {
			let hole = new THREE.Path(); // 添加孔洞
			for (let k = 0; k < howllowArr[n].length; k++) {
				hole.moveTo(howllowArr[n][k][0], -1 * howllowArr[n][k][1]);
				if (howllowArr[n][k].length == 4) {
					hole.lineTo(howllowArr[n][k][2], -1 * howllowArr[n][k][3]);
				} else {
					hole.bezierCurveTo(howllowArr[n][k][2], -1 * howllowArr[n][k][3], howllowArr[n][k][4], -1 * howllowArr[n][k][5], howllowArr[n][k][6], -1 * howllowArr[n][k][7]);
				}
			}
			shape.holes.push(hole);
		}
	}

	let scanGeometry = new THREE.ExtrudeGeometry(shape, options);
	let meshMaterial;
	meshMaterial = new THREE.MeshPhongMaterial({
		color: entityColor,
		transparent: true,
		side: THREE.DoubleSide,
		opacity: alphaModle
	});
	// 创建模型
	let mesh = new THREE.Mesh(scanGeometry, meshMaterial);
	
	if (name != "floor") {
		mesh.position.z = siteH;
	} else {
		mesh.position.z = -1 * parseInt(options.depth);
	}
	mesh.renderOrder = indexOrder;
	mesh.name = name || "";
	return mesh;
}

