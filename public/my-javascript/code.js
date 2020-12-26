$(document).ready(function() {
	//xu ly click thay doi mau
	$('.tdkhoi').click(function(event) {
		/* Act on the event */
		$(this).toggleClass('xanh');

		$(this).next().slideToggle(900,"easeInQuint");

		//su dung ham animate de chuyen noi dung len
		$('html,body').animate({scrollTop: $(this).offset().top },900,"easeInQuint")
	});
	//code cho phan phong to anh 
	$('.vaicaianh a').fancybox({ openEffect : 'elastic'});

     $('.ndkhoi').slideToggle();
});