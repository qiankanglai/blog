Menubar.Boolean = function ( signals ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );
	container.onMouseOver( function () { options.setDisplay( 'block' ) } );
	container.onMouseOut( function () { options.setDisplay( 'none' ) } );
	container.onClick( function () { options.setDisplay( 'block' ) } );

	var title = new UI.Panel();
	title.setTextContent( 'Boolean' ).setColor( '#666' );
	title.setMargin( '0px' );
	title.setPadding( '8px' );
	container.add( title );

	//

	var options = new UI.Panel();
	options.setClass( 'options' );
	options.setDisplay( 'none' );
	container.add( options );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Select as Object A' );
	option.onClick( function () { signals.booleanSelecteObject.dispatch(1); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Select as Object B' );
	option.onClick( function () { signals.booleanSelecteObject.dispatch(2);  } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( '---------CSG---------' );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Union' );
	option.onClick( function () { signals.booleanOperation.dispatch(1); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Intersection' );
	option.onClick( function () { signals.booleanOperation.dispatch(2); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Subtract' );
	option.onClick( function () { signals.booleanOperation.dispatch(3); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( '----------BO----------' );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Union' );
	option.onClick( function () { signals.booleanOperation.dispatch(4); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Intersection' );
	option.onClick( function () { signals.booleanOperation.dispatch(5); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Subtract' );
	option.onClick( function () { signals.booleanOperation.dispatch(6); } );
	options.add( option );

	var option = new UI.Panel();
	option.setClass( 'option' );
	option.setTextContent( 'Next Animation' );
	option.onClick( function () { signals.booleanAnimation.dispatch(); } );
	options.add( option );

	return container;

}
