/*
	THREE.CSG
	@author Chandler Prall <chandler.prall@gmail.com> http://chandler.prallfamily.com
	
	Wrapper for Evan Wallace's CSG library (https://github.com/evanw/csg.js/)
	Provides CSG capabilities for Three.js models.
	
	Provided under the MIT License
*/

THREE.CSG = {
	toCSG: function ( three_model, offset, rotation ) {
		var i, polygons, vertices, vertice;
		
		if ( !CSG ) {
			throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
		}
		
		var geometry = three_model.geometry;

		var polygons = [];
		for ( i = 0; i < geometry.faces.length; i++ ) {
			if ( geometry.faces[i] instanceof THREE.Face3 ) {
				
				vertices = [];
				vertice = geometry.vertices[geometry.faces[i].a].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].b].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].c].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				polygons.push( new CSG.Polygon( vertices ) );
				
			} else if ( geometry.faces[i] instanceof THREE.Face4 ) {
				
				vertices = [];
				vertice = geometry.vertices[geometry.faces[i].a].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].b].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].d].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				polygons.push( new CSG.Polygon( vertices ) );
				
				vertices = [];
				vertice = geometry.vertices[geometry.faces[i].b].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].c].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				vertice = geometry.vertices[geometry.faces[i].d].clone();
				vertices.push( new CSG.Vertex( three_model.localToWorld(vertice), [ geometry.faces[i].normal.x, geometry.faces[i].normal.y, geometry.faces[i].normal.z ] ) );
				polygons.push( new CSG.Polygon( vertices ) );
				
			} else {
				throw 'Model contains unsupported face.';
			}
		}
		
		return CSG.fromPolygons( polygons );
	},
	
	fromCSG: function( csg_model ) {
		var i, j, vertices, face,
			three_geometry = new THREE.Geometry( ),
			polygons = csg_model.toPolygons( );
		
		if ( !CSG ) {
			throw 'CSG library not loaded. Please get a copy from https://github.com/evanw/csg.js';
		}
		
		for ( i = 0; i < polygons.length; i++ ) {
			
			// Vertices
			vertices = [];
			for ( j = 0; j < polygons[i].vertices.length; j++ ) {
				vertices.push( this.getGeometryVertice( three_geometry, polygons[i].vertices[j].pos ) );
			}
			if ( vertices[0] === vertices[vertices.length - 1] ) {
				vertices.pop( );
			}
			
			for (var j = 2; j < vertices.length; j++) {
				face = new THREE.Face3( vertices[0], vertices[j-1], vertices[j], new THREE.Vector3( ).copy( polygons[i].plane.normal ) );
				three_geometry.faces.push( face );
				//three_geometry.faceVertexUvs[0].push( new THREE.UV( ) );
			}
		}
		
		three_geometry.computeVertexNormals();
		three_geometry.computeBoundingBox();
		
		return three_geometry;
	},
	
	getGeometryVertice: function ( geometry, vertice_position ) {
		var i;
		for ( i = 0; i < geometry.vertices.length; i++ ) {
			if ( geometry.vertices[i].x === vertice_position.x && geometry.vertices[i].y === vertice_position.y && geometry.vertices[i].z === vertice_position.z ) {
				// Vertice already exists
				return i;
			}
		};
		
		geometry.vertices.push( new THREE.Vector3( vertice_position.x, vertice_position.y, vertice_position.z ) );
		return geometry.vertices.length - 1;
	},

	printCSG: function ( csg_model ){
		console.log("==========");
		var i, j;
		var polygons = csg_model.toPolygons( );
		for ( i = 0; i < polygons.length; i++ ) {
			var buffer = "";
			for ( j = 0; j < polygons[i].vertices.length; j++ ) {
				buffer += '('+polygons[i].vertices[j].pos.x+','+polygons[i].vertices[j].pos.y+','+polygons[i].vertices[j].pos.z+')';
			}
			console.log(buffer);
		}
		console.log("==========");
	}
};