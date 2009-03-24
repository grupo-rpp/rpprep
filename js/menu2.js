function mainmenu(){
$(" #nav ul ").css({display: "none"}); // Opera Fix
$(" #nav li ").hover(function(){
		$(this).find('ul:first').css({visibility: "visible",display: "none"}).show(100);
		},function(){
		$(this).find('ul:first').css({visibility: "hidden"});
		});
}

 
 
 $(document).ready(function(){					
	mainmenu();
});