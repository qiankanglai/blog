var Viewport = function ( signals ) {
	var container = new UI.Panel();
	container.setPosition( 'absolute' );
	container.setBackgroundColor( '#aaa' );
	var info = new UI.Text();
	info.setPosition( 'absolute' );
	info.setRight( '5px' );
	info.setBottom( '5px' );
	info.setFontSize( '12px' );
	info.setColor( '#ffffff' );
	container.add( info );
	var clearColor = 0xAAAAAA;
	var objects = [];
	// helpers
	var helpersToObjects = {};
	var objectsToHelpers = {};
	var sceneHelpers = new THREE.Scene();
	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );
	var modifierAxis = new THREE.Vector3( 1, 1, 1 );
	var snapDist = null;
	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.color.setHex( 0xffff00 );
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );
	var selectionAxis = new THREE.AxisHelper( 100 );
	selectionAxis.material.depthTest = false;
	selectionAxis.material.transparent = true;
	selectionAxis.matrixAutoUpdate = false;
	selectionAxis.visible = false;
	sceneHelpers.add( selectionAxis );
	//
	var scene = new THREE.Scene();
	scene.booleanObject1 = undefined;
	scene.booleanObject2 = undefined;
	scene.booleanNeedAnimation = false;
	scene.booleanStep = -1;
	scene.booleanType = -1;
	var camera = new THREE.PerspectiveCamera( 50, container.dom.offsetWidth / container.dom.offsetHeight, 1, 5000 );
	camera.position.set( 500, 250, 500 );
	camera.lookAt( scene.position );
	// fog
	var oldFogType = "None";
	var oldFogColor = 0xaaaaaa;
	var oldFogNear = 1;
	var oldFogFar = 5000;
	var oldFogDensity = 0.00025;
	// object picking
	var intersectionPlane = new THREE.Mesh( new THREE.PlaneGeometry( 5000, 5000 ) );
	intersectionPlane.visible = false;
	sceneHelpers.add( intersectionPlane );
	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();
	var selected = camera;
	// events
	var getIntersects = function ( event, object ) {
		var vector = new THREE.Vector3(
			( event.layerX / container.dom.offsetWidth ) * 2 - 1,
			- ( event.layerY / container.dom.offsetHeight ) * 2 + 1,
			0.5
		);
		projector.unprojectVector( vector, camera );
		ray.set( camera.position, vector.sub( camera.position ).normalize() );
		if ( object instanceof Array ) {
			return ray.intersectObjects( object, true );
		}
		return ray.intersectObject( object, true );
	};
	var onMouseDownPosition = new THREE.Vector2();
	var onMouseMovePosition = new THREE.Vector2();
	var onMouseUpPosition = new THREE.Vector2();
	var onMouseDown = function ( event ) {
		event.preventDefault();
		container.dom.focus();
		onMouseDownPosition.set( event.layerX, event.layerY );
		if ( event.button === 0 ) {
			var intersects = getIntersects( event, objects );
			if ( intersects.length > 0 ) {
				var object = intersects[ 0 ].object;
				if ( selected === object || selected === helpersToObjects[ object.id ] ) {
					intersectionPlane.position.copy( selected.position );
					intersectionPlane.lookAt( camera.position );
					intersectionPlane.updateMatrixWorld();
					var intersects = ray.intersectObject( intersectionPlane );
					offset.copy( intersects[ 0 ].point ).sub( intersectionPlane.position );
					document.addEventListener( 'mousemove', onMouseMove, false );
					controls.enabled = false;
				}
			} else {
				controls.enabled = true;
			}
			document.addEventListener( 'mouseup', onMouseUp, false );
		}
	};
	var onMouseMove = function ( event ) {
		onMouseMovePosition.set( event.layerX, event.layerY );
		if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) > 1 ) {
			var intersects = getIntersects( event, intersectionPlane );
			if ( intersects.length > 0 ) {
				var point = intersects[ 0 ].point.sub( offset );
				if (snapDist) {
					point.x = Math.round( point.x / snapDist ) * snapDist;
					point.y = Math.round( point.y / snapDist ) * snapDist;
					point.z = Math.round( point.z / snapDist ) * snapDist;
				}
				selected.position.x = modifierAxis.x === 1 ? point.x : intersectionPlane.position.x;
				selected.position.y = modifierAxis.y === 1 ? point.y : intersectionPlane.position.y;
				selected.position.z = modifierAxis.z === 1 ? point.z : intersectionPlane.position.z;
				signals.objectChanged.dispatch( selected );
				render();
			}
		}
	};
	var onMouseUp = function ( event ) {
		onMouseUpPosition.set( event.layerX, event.layerY );
		if ( onMouseDownPosition.distanceTo( onMouseUpPosition ) < 1 ) {
			var intersects = getIntersects( event, objects );
			if ( intersects.length > 0 ) {
				selected = intersects[ 0 ].object;
				if ( helpersToObjects[ selected.id ] !== undefined ) {
					selected = helpersToObjects[ selected.id ];
				}
				signals.objectSelected.dispatch( selected );
			} else {
				controls.enabled = true;
				selected = camera;
				signals.objectSelected.dispatch( selected );
			}
			render();
		}
		document.removeEventListener( 'mousemove', onMouseMove );
		document.removeEventListener( 'mouseup', onMouseUp );
	};
	var onDoubleClick = function ( event ) {
		var intersects = getIntersects( event, objects );
		if ( intersects.length > 0 && intersects[ 0 ].object === selected ) {
			controls.focus( selected );
			controls.enabled = true;
		}
	};
	var removeObjectFromScene = function(object1){
		object1.traverse( function ( object ) {
			var index = objects.indexOf( object );
			if ( index !== -1 ) {
				objects.splice( index, 1 )
			}
		} );
		object1.parent.remove( object1 );
	};
	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );
	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.
	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {
		signals.objectChanged.dispatch( camera );
	} );
	// signals
	signals.modifierAxisChanged.add( function ( axis ) {
		modifierAxis.copy( axis );
	} );
	signals.snapChanged.add( function ( dist ) {
		snapDist = dist;
	} );
	signals.rendererChanged.add( function ( object ) {
		container.dom.removeChild( renderer.domElement );
		renderer = object;
		renderer.setClearColor( clearColor );
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		container.dom.appendChild( renderer.domElement );
		render();
	} );
	signals.sceneAdded.add( function ( object ) {
		scene.userData = JSON.parse( JSON.stringify( object.userData ) );
		while ( object.children.length > 0 ) {
			signals.objectAdded.dispatch( object.children[ 0 ] );
		}
	} );
	signals.objectAdded.add( function ( object ) {
		// handle children
		object.traverse( function ( object ) {
			// create helpers for invisible object types (lights, cameras, targets)
			if ( object instanceof THREE.PointLight ) {
				var helper = new THREE.PointLightHelper( object, 10 );
				sceneHelpers.add( helper );
				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;
				objects.push( helper.lightSphere );
			} else if ( object instanceof THREE.DirectionalLight ) {
				var helper = new THREE.DirectionalLightHelper( object, 10 );
				sceneHelpers.add( helper );
				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;
				objects.push( helper.lightSphere );
			} else if ( object instanceof THREE.SpotLight ) {
				var helper = new THREE.SpotLightHelper( object, 10 );
				sceneHelpers.add( helper );
				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;
				objects.push( helper.lightSphere );
			} else if ( object instanceof THREE.HemisphereLight ) {
				var helper = new THREE.HemisphereLightHelper( object, 10 );
				sceneHelpers.add( helper );
				objectsToHelpers[ object.id ] = helper;
				helpersToObjects[ helper.lightSphere.id ] = object;
				objects.push( helper.lightSphere );
			} else {
				// add to picking list
				objects.push( object );
			}
		} );
		scene.add( object );
		// TODO: Add support for hierarchies with lights
		if ( object instanceof THREE.Light )  {
			updateMaterials( scene );
		}
		updateInfo();
		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( object );
	} );
	// select object
	signals.objectSelected.add( function ( object ) {
		selectionBox.visible = false;
		selectionAxis.visible = false;
		if ( object !== null ) {
			if ( object.geometry !== undefined ) {
				selectionBox.update( object );
				selectionBox.visible = true;
			}
			// update axis on object
			selectionAxis.matrixWorld = object.matrixWorld;
			selectionAxis.visible = true;
			selected = object;
		}
		render();
	} );
	signals.objectChanged.add( function ( object ) {
		if ( object.geometry !== undefined ) {
			selectionBox.update( object );
			updateInfo();
		}
		if ( objectsToHelpers[ object.id ] !== undefined ) {
			objectsToHelpers[ object.id ].update();
		}
		render();
		signals.sceneChanged.dispatch( scene );
	} );
	signals.cloneSelectedObject.add( function () {
		if ( selected === camera ) return;
		var object = selected.clone();
		signals.objectAdded.dispatch( object );
	} );
	signals.removeSelectedObject.add( function () {
		if ( selected.parent === undefined ) return;
		var name = selected.name ?  '"' + selected.name + '"': "selected object";
		if ( confirm( 'Delete ' + name + '?' ) === false ) return;
		var parent = selected.parent;
		if ( selected instanceof THREE.PointLight ||
		     selected instanceof THREE.DirectionalLight ||
		     selected instanceof THREE.SpotLight ||
		     selected instanceof THREE.HemisphereLight ) {
			var helper = objectsToHelpers[ selected.id ];
			objects.splice( objects.indexOf( helper.lightSphere ), 1 );
			helper.parent.remove( helper );
			selected.parent.remove( selected );
			delete objectsToHelpers[ selected.id ];
			delete helpersToObjects[ helper.id ];
			if ( selected instanceof THREE.DirectionalLight ||
			     selected instanceof THREE.SpotLight ) {
				selected.target.parent.remove( selected.target );
			}
			updateMaterials( scene );
		} else {
			removeObjectFromScene(selected);
			updateInfo();
		}
		signals.sceneChanged.dispatch( scene );
		signals.objectSelected.dispatch( parent );
	} );
	signals.materialChanged.add( function ( material ) {
		render();
	} );
	signals.clearColorChanged.add( function ( color ) {
		renderer.setClearColor( color );
		render();
		clearColor = color;
	} );
	signals.fogTypeChanged.add( function ( fogType ) {
		if ( fogType !== oldFogType ) {
			if ( fogType === "None" ) {
				scene.fog = null;
			} else if ( fogType === "Fog" ) {
				scene.fog = new THREE.Fog( oldFogColor, oldFogNear, oldFogFar );
			} else if ( fogType === "FogExp2" ) {
				scene.fog = new THREE.FogExp2( oldFogColor, oldFogDensity );
			}
			updateMaterials( scene );
			oldFogType = fogType;
		}
		render();
	} );
	signals.fogColorChanged.add( function ( fogColor ) {
		oldFogColor = fogColor;
		updateFog( scene );
		render();
	} );
	signals.fogParametersChanged.add( function ( near, far, density ) {
		oldFogNear = near;
		oldFogFar = far;
		oldFogDensity = density;
		updateFog( scene );
		render();
	} );
	signals.windowResize.add( function () {
		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );
		render();
	} );
	signals.booleanSelecteObject.add( function (booleanID) {
		if ( selected.parent === undefined ) return;
		if ( !(selected instanceof THREE.Mesh) ) {
			alert("You must select Mesh as boolean operation objects!");
			return;
		}
		if(booleanID === 1){
			if(scene.booleanObject2 === selected.id)
				scene.booleanObject2 = undefined;
			scene.booleanObject1 = selected.id;
		}
		else if(booleanID === 2){
			if(scene.booleanObject1 === selected.id)
				scene.booleanObject1 = undefined;
			scene.booleanObject2 = selected.id;
		}
		scene.booleanStep = -1;
		scene.booleanType = -1;
		signals.sceneChanged.dispatch( scene );
	} );

	signals.booleanAnimation.add(function (arg) {
		if(arg === undefined){
			if(scene.booleanType < 0){
				alert("You should select a boolean operation first");
				return;
			}
			if(!scene.booleanNeedAnimation){
				alert("You should tick animation option at right top");
				return;
			}
			var object1 = undefined;
			var object2 = undefined;
			scene.traverse( function ( object ) {
				if ( object.id === scene.booleanObject1 ) {
					object1 = object;
				}
				else if ( object.id === scene.booleanObject2 ) {
					object2 = object;
				}
			} );
			if(object1 === undefined || object2 === undefined){
				alert("Two origin objects not found!");
				return;
			}
			var o1 = THREE.BO.toBO(object1);
			var o2 = THREE.BO.toBO(object2);
			var name;
			var geometry;
			if(scene.booleanStepObject != undefined){
				removeObjectFromScene(scene.booleanStepObject);
				scene.booleanStepObject = undefined;
			}
			scene.booleanStep ++;
			if(scene.booleanType === 1){
				geometry = THREE.BO.BO_helper(o1,o2,0,scene.booleanStep);
				name = 'Union';
			}
			else if(scene.booleanType === 2){
				geometry = THREE.BO.BO_helper(o1,o2,1,scene.booleanStep);
				name = 'Intersect';
			}
			else if(scene.booleanType === 3){
				geometry = THREE.BO.BO_helper(o1,o2,2,scene.booleanStep);
				name = 'Subtract';
			}
			console.log(geometry);
			if(scene.booleanStep < 5){
				object1.visible = false;
				object2.visible = false;
			}
			else{
				removeObjectFromScene(object1);
				removeObjectFromScene(object2);
				scene.booleanType = -1;
				scene.booleanStep = -1;
			}

			if(geometry[0].length > 0){
				scene.booleanStepObject = new THREE.Mesh(THREE.BO.fromBO( geometry ),new THREE.MeshPhongMaterial());
				scene.booleanStepObject.name = name+' ' + scene.booleanStepObject.id;
				scene.booleanStepObject.material.wireframe = true;
				scene.booleanStepObject.material.side = THREE.DoubleSide;
				scene.booleanStepObject.material.vertexColors = THREE.FaceColors;
				signals.objectAdded.dispatch( scene.booleanStepObject );
			}
			else{
				updateInfo();
				render();
				signals.sceneChanged.dispatch( scene );
			}
		}else{
			scene.booleanNeedAnimation = arg;
		}
	});
	signals.booleanOperation.add( function (booleanID) {
		var object1 = undefined;
		var object2 = undefined;
		scene.traverse( function ( object ) {
			if ( object.id === scene.booleanObject1 ) {
				object1 = object;
			}
			else if ( object.id === scene.booleanObject2 ) {
				object2 = object;
			}
		} );
		if(object1 === undefined || object2 === undefined){
			alert("You should select two object first!");
			return;
		}
		if(booleanID >= 1 && booleanID <= 3){
			var o1 = THREE.CSG.toCSG(object1);
			var o2 = THREE.CSG.toCSG(object2);
			var geometry, name;
			if(booleanID === 1){
				geometry = o1.union(o2);
				name = 'Union';
			}
			else if(booleanID === 2){
				geometry = o1.intersect(o2);
				name = 'Intersect';
			}
			else{
				geometry = o1.subtract(o2);
				name = 'Subtract';
			}
			var mesh = new THREE.Mesh(THREE.CSG.fromCSG( geometry ),new THREE.MeshPhongMaterial());
			mesh.name = name+' ' + mesh.id;

			//remove old objects
			removeObjectFromScene(object1);
			removeObjectFromScene(object2);
			
			signals.objectAdded.dispatch( mesh );
		}
		else if(booleanID >= 4 && booleanID <= 6){
			booleanID = booleanID - 3;
			var o1 = THREE.BO.toBO(object1);
			var o2 = THREE.BO.toBO(object2);
			var geometry, name;
			scene.booleanStep = -1;
			scene.booleanType = booleanID;
			if(scene.booleanNeedAnimation)
				scene.booleanStep = 0;
			if(booleanID === 1){
				geometry = THREE.BO.BO_helper(o1,o2,0,scene.booleanStep);
				name = 'Union';
			}
			else if(booleanID === 2){
				geometry = THREE.BO.BO_helper(o1,o2,1,scene.booleanStep);
				name = 'Intersect';
			}
			else{
				geometry = THREE.BO.BO_helper(o1,o2,2,scene.booleanStep);
				name = 'Subtract';
			}

			if(scene.booleanNeedAnimation){
				object1.visible = false;
				object2.visible = false;
			}
			else{
				removeObjectFromScene(object1);
				removeObjectFromScene(object2);
			}

			if(geometry[0].length > 0){
				scene.booleanStepObject = new THREE.Mesh(THREE.BO.fromBO( geometry ),new THREE.MeshPhongMaterial());
				scene.booleanStepObject.name = name+' ' + scene.booleanStepObject.id;
				if(scene.booleanNeedAnimation){					
					scene.booleanStepObject.material.wireframe = true;
					scene.booleanStepObject.material.side = THREE.DoubleSide;
					scene.booleanStepObject.material.vertexColors = THREE.FaceColors;
				}
				signals.objectAdded.dispatch( scene.booleanStepObject );
			}
			else{
				updateInfo();
				render();
				scene.booleanStepObject = undefined;
				signals.sceneChanged.dispatch( scene );
			}
		}
		else{
			alert("Unsupported boolean operation");
			return;
		}
	} );
	//
	var renderer;
	if ( System.support.webgl === true ) {
		renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	} else {
		renderer = new THREE.CanvasRenderer();
	}
	renderer.setClearColor( clearColor );
	renderer.autoClear = false;
	renderer.autoUpdateScene = false;
	container.dom.appendChild( renderer.domElement );
	animate();
	//
	function updateInfo() {
		var objects = 0;
		var vertices = 0;
		var faces = 0;
		scene.traverse( function ( object ) {
			if ( object instanceof THREE.Mesh ) {
				objects ++;
				vertices += object.geometry.vertices.length;
				faces += object.geometry.faces.length;
			}
		} );
		info.setValue( 'objects: ' + objects + ', vertices: ' + vertices + ', faces: ' + faces );
	}
	function updateMaterials( root ) {
		root.traverse( function ( node ) {
			if ( node.material ) {
				node.material.needsUpdate = true;
				if ( node.material instanceof THREE.MeshFaceMaterial ) {
					for ( var i = 0; i < node.material.materials.length; i ++ ) {
						node.material.materials[ i ].needsUpdate = true;
					}
				}
			}
		} );
	}
	function updateFog( root ) {
		if ( root.fog ) {
			root.fog.color.setHex( oldFogColor );
			if ( root.fog.near !== undefined ) root.fog.near = oldFogNear;
			if ( root.fog.far !== undefined ) root.fog.far = oldFogFar;
			if ( root.fog.density !== undefined ) root.fog.density = oldFogDensity;
		}
	}
	function animate() {
		requestAnimationFrame( animate );
	}
	function render() {
		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();
		renderer.clear();
		renderer.render( scene, camera );
		renderer.render( sceneHelpers, camera );
	}
	return container;
}
