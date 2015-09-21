function equalHeight(selectors){
    var height = 0;
    $(selectors).each(function(){
        height = Math.max( height, $(this).outerHeight() )
    });
    if($(window).outerWidth() >=1200){
        $(selectors).outerHeight(height);
    }else{
        $(selectors).outerHeight("auto");
    }

}
$(document).ready(function(){
    equalHeight('#nav .equal-height');
});
$(window).resize(function(){
    equalHeight('#nav .equal-height')
});

