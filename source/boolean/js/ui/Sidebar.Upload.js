Sidebar.Upload = function ( signals ) {

	var container = new UI.Panel();
	container.setPadding( '10px' );
	container.setBorderTop( '1px solid #ccc' );

	container.add( new UI.Text( 'UPLOAD OBJ MODEL' ).setColor( '#666' ) );
	container.add( new UI.Break(), new UI.Break() );

	var option = new UI.Panel();
	option.setTextContent('Drop OBJ Model Here');
	option.setPadding( '10px' );
	option.setColor( '#aaa' );
	option.setBorder( '2px dashed #bbb' );

	option.onDragOver(function handleDragOver(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	});
    option.onDrop(function handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    var files = evt.dataTransfer.files; // FileList object.
	    for (var i = 0, f; f = files[i]; i++) {
	    	var suf = f.name.split('.');
	    	suf = suf[suf.length-1];
	    	suf = suf.toLowerCase();
	    	if(suf !== 'obj'){
	    		console.warn('Cannot load model file other than OBJ: '+f.name);
	    		continue;
	    	}

      		var reader = new FileReader(); 
      		reader.onloadend = function(evt) {
      			if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      				var loader = new THREE.OBJLoader();
      				var obj = loader.parse(evt.target.result);
      				//Object3d->mesh
      				var mesh = obj.children[0];	
					signals.objectAdded.dispatch( mesh );
      			}
    		};

      		reader.readAsText(f);
	    }
    });
	container.add(option);

	container.add( new UI.Break() );

	var option = new UI.Panel();
	var checkBONeedAnimation = new UI.Checkbox( false );
	checkBONeedAnimation.onChange( function(){ signals.booleanAnimation.dispatch(checkBONeedAnimation.getValue()); } );
	option.add( new UI.Text( 'BO in Animation' ).setWidth( '150px' ).setColor( '#666' ) );
	option.add( checkBONeedAnimation );

	container.add( option );


	return container;

}
