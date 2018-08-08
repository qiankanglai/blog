THREE.BO = {
	getGeometryVertice: function ( vertices, vertice_position ) {
		var i;
		var l = vertices.length / 3;
		for ( i = 0; i < vertices.length; i++ ) {
			if ( vertices[3*i] === vertice_position.x && vertices[3*i+1] === vertice_position.y && vertices[3*i+2] === vertice_position.z ) {
				// Vertice already exists
				return i;
			}
		};
		
		vertices.push( vertice_position.x );
		vertices.push( vertice_position.y );
		vertices.push( vertice_position.z );
		return l;
	},
	toBO: function ( three_model, offset, rotation ) {
		var i;
		var geometry = three_model.geometry;
		var faces = [];
		var vertices = [];
		for ( i = 0; i < geometry.faces.length; i++ ) {
			if ( geometry.faces[i] instanceof THREE.Face3 ) {
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].a].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].b].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].c].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
			} else if ( geometry.faces[i] instanceof THREE.Face4 ) {
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].a].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].b].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].d].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));

				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].b].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].c].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
				var vertice = three_model.localToWorld(geometry.vertices[geometry.faces[i].d].clone());
				faces.push(this.getGeometryVertice(vertices, vertice));
			} else {
				throw 'Model contains unsupported face.';
			}
		}
		return [vertices, faces];
	},
	fromBO: function( model ) {		
		var vertices = model[0];
		var faces = model[1];
		var colors = model[2];
		var i;
		var three_geometry = new THREE.Geometry( );
		
		var l = vertices.length/3;
		for ( i = 0; i < l; i++ ) {
			var v = new THREE.Vector3( vertices[3*i], vertices[3*i+1], vertices[3*i+2]);
			three_geometry.vertices.push( v );
		}
		var l = faces.length/3;
		for ( i = 0; i < l; i++ ) {
			var color = new THREE.Color().setRGB(colors[3*i],colors[3*i+1],colors[3*i+2]);
			var face = new THREE.Face3( faces[3*i], faces[3*i+1], faces[3*i+2], new THREE.Vector3(), color);
			three_geometry.faces.push( face );
		}
		three_geometry.computeFaceNormals();
		three_geometry.computeVertexNormals();
		three_geometry.computeBoundingBox();
		
		return three_geometry;
	},
	make_int32_heap: function(f){
		var intData= new Int32Array(f.length);
		for (i= 0; i < f.length; i++) intData[i]= f[i];
			var numBytes= intData.length * intData.BYTES_PER_ELEMENT;
		var ptr= _malloc(numBytes);
		var heapBytes= new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
		heapBytes.set(new Uint8Array(intData.buffer));
		return heapBytes;
	},
	make_float_heap: function(v){
		var floatData= new Float32Array(v.length);
		for (i= 0; i < v.length; i++) floatData[i]= v[i];
			var numBytes= floatData.length * floatData.BYTES_PER_ELEMENT;
		var ptr= _malloc(numBytes);
		var heapBytes= new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);
		heapBytes.set(new Uint8Array(floatData.buffer));
		return heapBytes;
	},
	BO_helper: function(o1, o2, type, step){
		//http://comments.gmane.org/gmane.comp.compilers.emscripten/302
		/*
		void boolean_operate(float* vertices3d_a, int va_count, int* trifaces_a, int fa_count,
		                     float* vertices3d_b, int vb_count, int* trifaces_b, int fb_count,
		                     int type, int step)
		*/

		// create and populate some data
		var vertices_a = o1[0];
		var vertices_b = o2[0];
		var vertices_count_a = vertices_a.length/3;
		var vertices_count_b = vertices_b.length/3;
		var faces_a = o1[1];
		var faces_b = o2[1];
		var faces_out_a = faces_a.length/3;
		var faces_out_b = faces_b.length/3;
		var heap_vertices_a = this.make_float_heap(vertices_a);
		var heap_vertices_b = this.make_float_heap(vertices_b);
		var heap_face_a = this.make_int32_heap(faces_a);
		var heap_face_b = this.make_int32_heap(faces_b);

		// call the c function which should modify the vals
		var result = _boolean_operate(heap_vertices_a.byteOffset, vertices_count_a, heap_face_a.byteOffset, faces_out_a,
			heap_vertices_b.byteOffset, vertices_count_b, heap_face_b.byteOffset, faces_out_b,
			type, step);

		// free the heap buffer
		_free(vertices_a.byteOffset);
		_free(vertices_b.byteOffset);
		_free(faces_a.byteOffset);
		_free(faces_b.byteOffset);

		var heapInts= new Int32Array(Module.HEAPU8.buffer, result, 2);
		var face_count = heapInts[1];
		var vertices_count = heapInts[0];
		var f = new Int32Array(Module.HEAPU8.buffer, 
			result+heapInts.length * heapInts.BYTES_PER_ELEMENT,
			face_count*3);//face
		var v = new Float32Array(Module.HEAPU8.buffer, 
			result+heapInts.length * heapInts.BYTES_PER_ELEMENT+f.length * f.BYTES_PER_ELEMENT,
			vertices_count*3);//vertices
		var c = new Float32Array(Module.HEAPU8.buffer, 
			result+heapInts.length * heapInts.BYTES_PER_ELEMENT+f.length * f.BYTES_PER_ELEMENT+v.length * v.BYTES_PER_ELEMENT,
			face_count*3);//color
		var r = [new Float32Array(v), new Int32Array(f), new Float32Array(c)];	//copy
		_free(result);
		return r;
	}
}
