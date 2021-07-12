
let material, aspect, ortNum = 1800;
let siteIcon;

/**
 * 地图主类，入口 初始化设备点位
 * @param width,height  勾图的地图宽、高
 * @param floor,  楼层编号从0开始
 * @param navPoint,   导航点位
 * @param angle(-180~180)  设备角度
 */
MainMap_QM = function (callBackFun) {

	this.callBackLoadOver = callBackFun;
	let ele = document.getElementById("threeDiv");
	this.w = parseInt(ele.clientWidth);
	this.h = parseInt(ele.clientHeight);

	this.scene = new THREE.Scene();

	this.scene.name = "scene";
	aspect = this.w / this.h;
	this.camera = new THREE.OrthographicCamera(ortNum * aspect / - 2, ortNum * aspect / 2, ortNum / 2, ortNum / - 2, 1, 10000);
	this.camera.position.set(0, 500, 500);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));

	this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });   //
	this.renderer.antialias = true;
	this.renderer.autoClear = true;
	this.renderer.setSize(this.w, this.h);
	ele.appendChild(this.renderer.domElement);

	let directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
	let aLight = new THREE.AmbientLight(0xffffff, 0.52);
	directionalLight.name = "light";
	this.scene.add(aLight);
	aLight.name = "light";
	this.scene.add(directionalLight);

	this.CSSObject = new THREE.Object3D();
	this.scene.add(this.CSSObject);
	this.labelRenderer = new THREE.CSS2DRenderer();
	this.labelRenderer.setSize(this.w, this.h, "-50%");
	this.labelRenderer.domElement.style.position = 'absolute';
	this.labelRenderer.domElement.style.top = 0;
	ele.appendChild(this.labelRenderer.domElement);

	this.controls = new THREE.OrbitControls(this.camera, this.labelRenderer.domElement);
	//禁用旋转
	this.controls.enableRotate = false;
	//设置相机距离原点的最远距离
	this.controls.minPolarAngle = 0;  // radians
	this.controls.maxPolarAngle = 0.001;   // radians
	this.controls.addEventListener('change', this.onControlChange, false);
	this.floor;
	window.addEventListener('resize', this.onWindowResize, false);           //窗口变化
	document.getElementById('threeDiv').addEventListener('click', this.onMouseClick, false);
}

MainMap_QM.prototype = {
	initBuild: function (e) {
		siteIcon = null;
		Map_QM.floor = new FloorMap_QM();
		Map_QM.floor.initDraw();
		Map_QM.floor.allObj.position.set(0, 0, 0);
		this.scene.add(Map_QM.floor.allObj);
		setInterval(() => {
			Map_QM.render();
		}, 30)
	},
	/**
	 * 楼层切换
	 * @param {int}  bIndex    楼栋编号
	 * @param {int}  fIndex    楼层编号
	 */
	changeFloor: function (bIndex = -1, fIndex = -1) {
		if (bIndex != -1) {
			deviceSite.buildOrder = bIndex;
		}
		if (fIndex != -1) {
			deviceSite.floorOrder = fIndex;
		}
		siteIcon = null;
		this.renderer.dispose();
		this.remove_child(this.scene);
		Map_QM.floor = new FloorMap_QM();
		Map_QM.floor.initDraw();
		Map_QM.floor.allObj.position.set(0, 0, 0);
		this.scene.add(Map_QM.floor.allObj);
	},
	remove_child: function (remObj) {
		if (!remObj) {
			return;
		}
		let child_elem = remObj.children;
		for (let i = child_elem.length - 1; i >= 0; i--) {
			if (child_elem[i].children.length > 0) {
				Map_QM.remove_child(child_elem[i]);
			} else {
				if (child_elem[i] instanceof THREE.Mesh) {
					child_elem[i].geometry.dispose(); // 删除几何体
					if (child_elem[i].material !== undefined) Map_QM.removeMaterial(child_elem.material); // 删除材质
				}
			}
			if (child_elem[i].name != "light") {
				remObj.remove(child_elem[i]);
			}
		}

	},
	removeMaterial: function (material) {
		if (Array.isArray(material)) {
			for (var i = 0, l = material.length; i < l; i++) {
				this.removeMaterialFromRefCounter(material[i]);
			}
		} else {
			this.removeMaterialFromRefCounter(material);
		}
	},
	removeMaterialFromRefCounter: function (material) {
		var materialsRefCounter = this.materialsRefCounter;
		if (materialsRefCounter) {
			var count = materialsRefCounter.get(material);
			count--;
			if (count === 0) {
				materialsRefCounter.delete(material);
				delete this.materials[material.uuid];
			} else {
				materialsRefCounter.set(material, count);
			}
		}
	},
	/**
	 * 隐藏或者显示点位
	 */
	showOrHidePoint: function (isShow = true) {
		Map_QM.floor.pathObj.traverse((obj) => {
			obj.visible = isShow;
		});
	},
	/**
	 * 隐藏或者显示label
	 */
	showOrHideLabel: function (isShow = true) {
		Map_QM.floor.labelObj.traverse((obj) => {
			obj.visible = isShow;
		});
	},
	/**
	 * 创建标签
	 */
	addElementLabel: function (divObj, x = 0, y = 0) {
		let shopInfo = new THREE.CSS2DObject(divObj);
		shopInfo.position.set(x, -1 * y, 20);
		shopInfo.applyMatrix(Map_QM.floor.allObj.matrix);
		Map_QM.CSSObject.add(shopInfo);
		return shopInfo;
	},
	/**
	 * 销毁标签
	 */
	elementDestroy(obj = null) {

		if (obj) {
			Map_QM.CSSObject.remove(obj)
		} else {
			Map_QM.CSSObject.traverse((obj1) => {
				Map_QM.CSSObject.remove(obj1)
			});
		}
	},
	/**
	 * @param {Object} e
	 * 地图BOX点击
	 */
	onMouseClick: function (event) {
		let mouse = new THREE.Vector2();
		const { left, top } = Map_QM.renderer.domElement.getBoundingClientRect();
		mouse.x = (((event.offsetX)) / Map_QM.w) * 2 - 1;
		mouse.y = -(((event.offsetY)) / Map_QM.h) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, Map_QM.camera);

		let interDevs = raycaster.intersectObjects(Map_QM.floor.devObj.children, true);
		if (interDevs.length > 0) {
			let selected = interDevs[0].object;//取第一个物体
			Config.callBack({ "name": selected.name, "x": parseInt(selected.position.x), "y": parseInt(selected.position.y), "floorOrder": deviceSite.floorOrder });
		} else {
			let intersects = raycaster.intersectObjects(Map_QM.floor.pathObj.children, true);
			if (intersects.length > 0) {
				let selected = intersects[0].object;//取第一个物体
				let site = { "x": parseInt(selected.position.x), "y": parseInt(selected.position.y), "navPoint": selected.name, "angle": parseInt(deviceSite.angle), "floorOrder": deviceSite.floorOrder };
				Config.setDeviceSite(site);
			}
		}
	},
	createPointCanvas: function (text, color) {
		let canvas = document.createElement("canvas");
		canvas.width = 34, canvas.height = 34;
		let context = canvas.getContext("2d");
		context.beginPath();
		context.arc(17, 17, 16, 0, 2 * Math.PI);
		context.closePath();
		context.stroke();
		context.fillStyle = color;  //'rgba(0, 0, 255, 0.5)'
		context.fill();
		context.font = '20px Arial';
		context.fillStyle = 'rgba(255, 255, 255, 1)';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(text, canvas.width / 2, canvas.height / 2);
		return canvas;
	},
	//窗口变化
	onWindowResize: function () {
		//
		let ele = document.getElementById("threeDiv");
		let ww = parseInt(ele.clientWidth);
		let wh = parseInt(ele.clientHeight);
		aspect = ww / wh;
		Map_QM.camera.left = ortNum * aspect / -2;
		Map_QM.camera.right = ortNum * aspect / 2;
		Map_QM.camera.top = ortNum / 2;
		Map_QM.camera.bottom = ortNum / -2;
		Map_QM.camera.updateProjectionMatrix();
		Map_QM.renderer.setSize(ww, wh);
		Map_QM.labelRenderer.setSize(ww, wh);
	},
	onControlChange: function (event) {
		Map_QM.collisionChock(Config.selectFloor_3d);
	},
	/**
	 * 碰撞检测
	 * @param {Object} 传入检测楼层下标 
	 */
	collisionChock: function (n) {
		outTime = setTimeout(() => {
			clearTimeout(outTime);
			if (Config.pzState) {
				let checkList = [];

				if (Map_QM.mapArr[n]) {
					let childs = Map_QM.mapArr[n].labelObj.children;
					Map_QM.checkCollosion(childs, checkList, n);
				}
			}
		}, 100);
	},

	//外部调用旋转
	rotateSite: function (angle) {
		let site = { "x": parseInt(deviceSite.x), "y": parseInt(deviceSite.y), "navPoint": deviceSite.navPoint, "angle": parseInt(angle), "floorOrder": deviceSite.floorOrder };
		Config.setDeviceSite(site);
		Map_QM.floor.setStartSite();
	},
	//提供给外部调用    实时渲染
	render: function () {
		this.camera.updateProjectionMatrix();
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.labelRenderer.render(this.scene, this.camera);
	}
}

FloorMap_QM = function () {
	this.Model_QM = new MyModel_QM();
	this.facUtil = new Facilities_QM();
	this.allObj = new THREE.Object3D();
	this.allObj.rotation.x = Math.PI / -2;
	this.labelObj = new THREE.Group();
	this.labelObj.renderOrder = 100;
	this.allObj.add(this.labelObj);
	this.pathObj = new THREE.Object3D();
	this.allObj.add(this.pathObj);
	this.devObj = new THREE.Object3D();
	this.allObj.add(this.devObj);
}

FloorMap_QM.prototype.initDraw = function () {
	let array = JSON.parse(mapJSON);
	let mapArray;
	if (parseInt(deviceSite.buildOrder) < array.length) {
		mapArray = array[parseInt(deviceSite.buildOrder)].buildArr;
	}
	mapObj = mapArray[parseInt(deviceSite.floorOrder)];
	this.initFloor();
	this.initPath();
	//this.initFacilitie();
	//this.initStairs();
	this.initWall();
	this.initDecos();
	this.initDevice();
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

	let css = `color: ${Config.pocColor};height: ${parseInt(Config.pocHeight) * 0.2}px;
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
			}, 0, entColor, borderColor, 1, i);
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
//初始化设备
FloorMap_QM.prototype.initDevice = function () {
	console.log(shopJSON, deviceSite);
	if (parseInt(deviceSite.buildOrder) < shopJSON.length && parseInt(deviceSite.floorOrder) < shopJSON[parseInt(deviceSite.buildOrder)].floors.length) {
		let devArr = shopJSON[parseInt(deviceSite.buildOrder)].floors[parseInt(deviceSite.floorOrder)].devices;
		for (let i = 0; i < devArr.length; i++) {
			if (mapObj.mapData.path) {
				let pathArr = mapObj.mapData.path.nodes;
				pathArr.sort(Config.sortNode);
				let index = parseInt(devArr[i].yaxis);
				let planeGeom = new THREE.PlaneGeometry(48, 48);
				let texture = new THREE.Texture();
				let color = devArr[i].deviceOnline ? 'rgba(0, 225, 0, 1)' : 'rgba(225, 0, 0, 1)';
				texture.image = Map_QM.createPointCanvas("", color);
				texture.needsUpdate = true;
				let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthTest: false, transparent: true });
				let plane = new THREE.Mesh(planeGeom, material)
				plane.position.x = pathArr[index].x;
				plane.position.y = -1 * pathArr[index].y;
				plane.position.z = 2;
				plane.renderOrder = 210;
				plane.name = devArr[i].devNum;
				this.devObj.add(plane);
			}
		}
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
FloorMap_QM.prototype.initPath = function () {
	if (mapObj.mapData.path) {
		let pathArr = mapObj.mapData.path.nodes;
		for (let i = 0; i < pathArr.length; i++) {
			let has = false;
			let facArr = mapObj.mapData.stairs;
			for (let i = 0; i < facArr.length; i++) {
				if (facArr[i].navCode == pathArr[i].id) {
					has = true;
					break;
				}
			}
			if (!has) {
				let planeGeom = new THREE.PlaneGeometry(48, 48);
				let texture = new THREE.Texture();
				texture.image = Map_QM.createPointCanvas(pathArr[i].id, 'rgba(0, 0, 255, 0.5)');
				texture.needsUpdate = true;
				let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, depthTest: false, transparent: true });
				let plane = new THREE.Mesh(planeGeom, material)
				plane.position.x = pathArr[i].x;
				plane.position.y = -1 * pathArr[i].y;
				plane.position.z = 2;
				plane.renderOrder = 210;
				plane.name = pathArr[i].id;
				this.pathObj.add(plane);
			}
		}
	}
}

/**
 * 设置起点
 * @param {Object} startNode
 * @param {Object} endNode
 */
FloorMap_QM.prototype.setStartSite = function () {
	if (!siteIcon) {
		let planeGeom = new THREE.PlaneGeometry(100, 100);
		let textu = new THREE.TextureLoader().load("img/site.png");
		let material = new THREE.MeshBasicMaterial({ map: textu, side: THREE.DoubleSide, depthTest: false, transparent: true });
		siteIcon = new THREE.Mesh(planeGeom, material)
		siteIcon.center = new THREE.Vector2(0.5, 0.5);
		siteIcon.renderOrder = 208;
		this.allObj.add(siteIcon);
	}
	siteIcon.position.set(deviceSite.x, deviceSite.y, 5);
	siteIcon.rotation.z = deviceSite.angle * Math.PI / -180;
}
//初始化装饰
FloorMap_QM.prototype.initDecos = function () {
	let css_TD = `color: ${Config.pocColor};
	writing-mode: vertical-rl; text-orientation: upright;
	font-size: ${parseInt(Config.pocHeight)}px; animation: hideIndex 1s; z-index: 90; 
	transform-origin:center center;`;

	let css_LR = `color: ${Config.pocColor};height: ${parseInt(Config.pocHeight) + 2}px;
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
				shopDiv.style.cssText = mapData.decos[i].rangeType == "LR" ? css_LR : css_TD;
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
				"type": "wall"
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

/**
 * 公共设施
 */
MySprite_QM = function (spriteMaterial, obj) {

	THREE.Sprite.call(this);

	this.navCode = obj.navCode;
	this.no = obj.no;
	this.toFloor = obj.toFloor;
	this.facCode = obj.facCode;
	this.imgUrl;
	this.material = (spriteMaterial !== undefined) ? spriteMaterial : new SpriteMaterial();

	//图标跳动
	this.jumpIcon = function () {
		let bounce2 = {
			z: 80
		};
		let oldZ = Config.floorHeight + Config.buildHeight + Config.shopHeight;
		let bounce1 = {
			z: oldZ
		};
		let self = this;

		let tween1 = new TWEEN.Tween(bounce1, Map_QM.groupT).to({
			z: 80
		}, 500)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onUpdate(() => {
				self.position.z = bounce1.z;
			})
			.repeat(2);
		let tween2 = new TWEEN.Tween(bounce2, Map_QM.groupT).to({
			z: oldZ
		}, 500)
			.easing(TWEEN.Easing.Quadratic.In)
			.onUpdate(() => {
				self.position.z = bounce2.z;
			});
		tween1.chain(tween2);
		tween1.start();
	}
	this.reSetSite = function () { //重置位置
		this.position.z = parseInt(Config.floorHeight) + parseInt(Config.buildHeight) + parseInt(Config.shopHeight);
	}
};

MySprite_QM.prototype = Object.create(THREE.Sprite.prototype);
MySprite_QM.prototype.constructor = MySprite_QM;

/**
 * 渲染公共设施
 */
Facilities_QM = function () {


}
Facilities_QM.prototype.renderIcon = function (obj, _this, type, showH) {
	if (obj) {
		let spriteMaterial;
		for (let m = 0; m < Config.spriteMaterialArr.length; m++) {
			if (Config.spriteMaterialArr[m].name == obj.facCode) {
				spriteMaterial = Config.spriteMaterialArr[m];
			}
		}
		if (!spriteMaterial) {
			let spriteMap = new THREE.TextureLoader().load("./img/" + obj.facCode + ".png");
			spriteMaterial = new THREE.SpriteMaterial({
				map: spriteMap,
				depthTest: true,
				transparent: true
			});
			spriteMaterial.name = obj.facCode;
			Config.spriteMaterialArr.push(spriteMaterial);
		}

		let sprite = new MySprite_QM(spriteMaterial, obj);
		let ax = parseInt(deviceSite.angle) < 0 ? 0 : 0.5;
		sprite.center = new THREE.Vector2(ax, ax);
		sprite.scale.set(32, 32, 1);
		sprite.imgUrl = "./img/" + obj.facCode + ".png";
		sprite.position.set(obj.x, -1 * obj.y, showH);
		sprite.renderOrder = 200;
		_this.allObj.add(sprite);
	}
}

/**
 * 店铺LOGO地图展示类
 */
ShopLogo_QM = function () {
	this.renderIcon = function (obj, _this) {
		if (obj) {
			let x = obj.xaxis >> 0;
			let y = -1 * obj.yaxis >> 0;
			let z = parseInt(Config.floorHeight) + parseInt(Config.buildHeight) + parseInt(Config.shopHeight);
			let imgW = obj.imgW >> 0;
			let imgH = obj.imgH >> 0;

			new THREE.TextureLoader().load(obj.logoUrl, textu => {
				let planeMaterial = new THREE.MeshPhongMaterial({
					map: textu,
					depthTest: false,
					transparent: true
				});
				let planeGeometry = new THREE.PlaneGeometry(imgW, imgH);
				let plane = new THREE.Mesh(planeGeometry, planeMaterial);
				plane.center = new THREE.Vector2(0, 0);
				plane.position.set(x, y, z);
				plane.renderOrder = 70;
				_this.allObj.add(plane);
			});
		}
	}
}
MySprite_QM.prototype.constructor = MySprite_QM;

/**
 * 箭头
 */
MyArrow_QM = function (arrowGeometry, arrowMaterial, pathArr, _index = 0) {

	THREE.Mesh.call(this, arrowGeometry, arrowMaterial);
	this.pathArr = pathArr;
	this._index = _index;
	//图标移动
	this.moveIcon = function () {
		let px = this.position.x;
		let py = this.position.y;
		let targetX = this.pathArr[this._index].x - px;
		let targetY = -1 * this.pathArr[this._index].y - py;
		let dist = Math.sqrt(targetX * targetX + targetY * targetY);
		let df = Math.ceil(dist / 4);
		let dx = (this.pathArr[this._index].x - px) / df;
		let dy = ((-1 * this.pathArr[this._index].y) - py) / df;
		let ang = 0;
		if (df < 2) {
			this.position.set(this.pathArr[this._index].x, -1 * this.pathArr[this._index].y, parseInt(Config.floorHeight) + parseInt(Config.buildHeight) + 4);
			this.rotation.z = 0;
			this._index++;
			if (this._index > 0 && this._index < this.pathArr.length) {
				let s = Math.sqrt((this.pathArr[this._index].x - this.pathArr[this._index - 1].x) * (this.pathArr[this._index].x - this.pathArr[this._index - 1].x) + (
					this.pathArr[this._index].y - this.pathArr[this._index - 1].y) * (this.pathArr[this._index].y - this.pathArr[this._index - 1].y));
				ang = Math.acos((this.pathArr[this._index].y - this.pathArr[this._index - 1].y) / s);
				if (this.pathArr[this._index].x < this.pathArr[this._index - 1].x) {
					this.rotation.z = Math.PI - ang;
				} else {
					this.rotation.z = ang + Math.PI;
				}
			}
		} else {
			px += dx;
			py += dy;
			this.position.set(px, py, parseInt(Config.floorHeight) + parseInt(Config.buildHeight) + 4);
		}
	}
};

MyArrow_QM.prototype = Object.create(THREE.Mesh.prototype);
MyArrow_QM.prototype.constructor = MyArrow_QM;


