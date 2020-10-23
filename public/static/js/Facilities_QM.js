/**
 * 公共设施
 */
MySprite_QM = function(spriteMaterial, obj) {

	THREE.Sprite.call(this);

	this.navCode = obj.navCode;
	this.no = obj.no;
	this.toFloor = obj.toFloor;
	this.facCode = obj.facCode;
	this.imgUrl;
	this.material = (spriteMaterial !== undefined) ? spriteMaterial : new SpriteMaterial();

	//图标跳动
	this.jumpIcon = function() {
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
	this.reSetSite = function() { //重置位置
		this.position.z = parseInt(Config.floorHeight) + parseInt(Config.buildHeight) + parseInt(Config.shopHeight);
	}
};

MySprite_QM.prototype = Object.create(THREE.Sprite.prototype);
MySprite_QM.prototype.constructor = MySprite_QM;

/**
 * 渲染公共设施
 */
Facilities_QM = function() {
	

}
Facilities_QM.prototype.renderIcon = function(obj, _this, type, showH) {
	if (obj) {
		let spriteMaterial;
		for (let m = 0; m < Config.spriteMaterialArr.length; m++) {
			if (Config.spriteMaterialArr[m].name == obj.facCode) {
				spriteMaterial = Config.spriteMaterialArr[m];
			}
		}
		if (!spriteMaterial) {
			let spriteMap = new THREE.TextureLoader().load("./img/"+obj.facCode+".png");
			spriteMaterial = new THREE.SpriteMaterial({
				map: spriteMap,
				depthTest: true,
				transparent: true
			});
			spriteMaterial.name = obj.facCode;
			Config.spriteMaterialArr.push(spriteMaterial);
		}

		let sprite = new MySprite_QM(spriteMaterial, obj);
		let ax = parseInt(deviceSite.angle)<0 ? 0:0.5;
		sprite.center = new THREE.Vector2(ax, ax);
		sprite.scale.set(obj.width * 2, obj.height * 2, 1);
		sprite.imgUrl = "./img/icon/"+obj.facCode+".png";
		sprite.position.set(obj.x+16*Math.sin(parseInt(deviceSite.angle)*Math.PI/180), -1 * obj.y-16*Math.sin(parseInt(deviceSite.angle)*Math.PI/180), showH);
		sprite.renderOrder = 200;
		_this.allObj.add(sprite);
	}
}

/**
 * 店铺LOGO地图展示类
 */
ShopLogo_QM = function() {
	this.renderIcon = function(obj, _this) {
		if (obj) {
			let x = obj.xaxis >> 0;
			let y = -1 * obj.yaxis >> 0;
			let z = parseInt(Config.floorHeight)+parseInt(Config.buildHeight)+parseInt(Config.shopHeight);
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
MyArrow_QM = function(arrowGeometry, arrowMaterial,pathArr,_index=0) {

	THREE.Mesh.call(this, arrowGeometry, arrowMaterial);
	this.pathArr = pathArr;
	this._index = _index;
	//图标移动
	this.moveIcon = function() {
		let px = this.position.x;
		let py = this.position.y;
		let targetX = this.pathArr[this._index].x - px;
		let targetY = -1 * this.pathArr[this._index].y - py;
		let dist = Math.sqrt(targetX * targetX + targetY * targetY);
		let df = Math.ceil(dist/4);
		let dx = (this.pathArr[this._index].x - px) / df;
		let dy = ((-1 * this.pathArr[this._index].y) - py) / df;
		let ang = 0;
		if (df < 2) {
			this.position.set(this.pathArr[this._index].x,-1*this.pathArr[this._index].y,parseInt(Config.floorHeight) + parseInt(Config.buildHeight)+4);
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
		}else {
			px += dx;
			py += dy;
			this.position.set(px,py,parseInt(Config.floorHeight)+parseInt(Config.buildHeight)+4);
		}
	}
};

MyArrow_QM.prototype = Object.create(THREE.Mesh.prototype);
MyArrow_QM.prototype.constructor = MyArrow_QM;
