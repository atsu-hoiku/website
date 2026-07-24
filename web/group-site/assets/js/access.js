$(function () {
    // #seibu以外を隠す
    $("#choices2 #seibu").siblings().hide();



    $("#choices1 a").on("click", function () {


        $("#choices2 div").hide();


        $($(this).attr("href")).show();


        $("#choices1 a").removeClass("current");

        $(this).addClass("current");

        // aタグの遷移機能オフ
        return false;
    });

});