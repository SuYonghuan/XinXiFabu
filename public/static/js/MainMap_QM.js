
let material,aspect,ortNum=1800;
let siteIcon;

/**
 * 地图主类，入口 初始化设备点位
 * @param width,height  勾图的地图宽、高
 * @param floor,  楼层编号从0开始
 * @param navPoint,   导航点位
 * @param angle(-180~180)  设备角度
 */
MainMap_QM = function(callBackFun) {
	
	this.callBackLoadOver = callBackFun;
	let ele = document.getElementById("threeDiv");
	this.w = parseInt(ele.clientWidth);
	this.h = parseInt(ele.clientHeight);
	
	this.scene = new THREE.Scene();
	
	this.scene.name="scene";
	aspect = this.w / this.h;
	this.camera = new THREE.OrthographicCamera( ortNum * aspect / - 2, ortNum * aspect / 2, ortNum / 2, ortNum / - 2, 1, 10000 );
	this.camera.position.set(0,500, 500);
	this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	
	this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});   //
	this.renderer.antialias = true;
	//this.renderer.sortObjects = false;
	this.renderer.autoClear = true;
	this.renderer.setSize(this.w, this.h);
	ele.appendChild(this.renderer.domElement);

	let  directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
	let aLight =  new THREE.AmbientLight(0xffffff, 0.52);
	this.scene.add(aLight);
	this.scene.add(directionalLight);

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
	this.floor;  
	window.addEventListener('resize', this.onWindowResize, false);           //窗口变化
	document.getElementById('threeDiv').addEventListener('click', this.onMouseClick, false);
}

MainMap_QM.prototype = {
	initBuild:function(e) {
    siteIcon=null;
		Map_QM.floor = new FloorMap_QM();
		let a = Map_QM.controls.getRotateHorizontal();
		//Map_QM.controls.setRotateHorizontal(a - parseInt(deviceSite.angle) / 180 * Math.PI);
		Map_QM.floor.initDraw();
		Map_QM.floor.allObj.position.set(0, 0, 0);
		this.scene.add(Map_QM.floor.allObj);
		setInterval(()=>{
			Map_QM.render();
		},30)
	},
	/**
	 * @param {Object} e
	 * 地图BOX点击
	 */
	onMouseClick:function (event) {
		let mouse = new THREE.Vector2();
		mouse.x = (((event.clientX-225)) / Map_QM.w) * 2 - 1;
		mouse.y = -(((event.clientY-540)) / Map_QM.h) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, Map_QM.camera);
		let intersects = raycaster.intersectObjects(Map_QM.floor.pathObj.children,true);
    // let site = {"x":0, "y":0, "navPoint":0, "angle":0, "floorOrder":0};
		if (intersects.length > 0) {
			let selected = intersects[0].object;//取第一个物体
			let site = {"x":parseInt(selected.position.x), "y":parseInt(selected.position.y), "navPoint":selected.name, "angle":parseInt(deviceSite.angle), "floorOrder":deviceSite.floorOrder};
      Config.setDeviceSite(site);
			Map_QM.floor.setStartSite();
		}

	},
	createPointCanvas:function(text) {
        let canvas = document.createElement("canvas");
        canvas.width = 34, canvas.height = 34;
		let context = canvas.getContext("2d");
        context.beginPath();
		context.arc(17, 17, 16, 0, 2 * Math.PI);
		context.closePath();
		context.stroke();
		context.fillStyle = 'rgba(0, 0, 255, 0.5)';
		context.fill();
        context.font = '20px Arial';
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width/2, canvas.height/2);
        return canvas;
    },
	//窗口变化
	onWindowResize:function() {
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
	//外部调用旋转
	rotateSite:function (angle){
		let site = {"x":parseInt(deviceSite.x), "y":parseInt(deviceSite.y), "navPoint":deviceSite.navPoint, "angle":parseInt(angle), "floorOrder":deviceSite.floorOrder};
		Config.setDeviceSite(site);
		Map_QM.floor.setStartSite();
	},
	//提供给外部调用    实时渲染
	render:function() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.labelRenderer.render(this.scene, this.camera);
	}
}

