$(function () {

    // アラートメッセージをすべて非表示
    $(".alert, .error2").hide();
    // 
    // 送信ボタンがクリックされたら処理を実行する
    $("#submitBtn").on("click", function () {

        // 送信判定用の旗として変数を作成
        // 初めはtrue(〇のようなイメージ)を入れておく
        let sendFlag = true;


        // ★ お名前入力欄の入力チェック
        // 入力欄が取得できない状態（つまり空欄）の場合、
        // 該当箇所のアラートを表示
        // 空欄じゃなくなったらアラートを非表示

        if (!$("#name").val()) {
            $("#nameSection .alert").show();
            sendFlag = false;
        } else {
            $("#nameSection .alert").hide();
        }

        // フリガナ入力欄の入力チェック

        if (!$("#textfuri").val()) {
            $("#textfuriSection .alert").show();
            sendFlag = false;
        } else {
            $("#textfuriSection .alert").hide();
        }


        // ★メアド＆電話入力欄チェック
        if (!$("#email").val()) {
            $("#mailSection .alert").show();
            sendFlag = false;
        } else {
            $("#mailSection .alert").hide();
        }

        if (!$("#tel").val()) {
            $("#telSection .alert").show();
            sendFlag = false;
        } else {
            $("#telSection .alert").hide();
        }

        // ★メアド＆電話形式チェック
        if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test($("#email").val())) {
            $("#mailSection .alert").show();
            sendFlag = false;
        } else {
            $("#mailSection .alert").hide();
        }

        if (!/^[0-9]{10,11}$/.test($("#tel").val())) {
            $("#telSection .alert").show();
            sendFlag = false;
        } else {
            $("#telSection .alert").hide();
        }

        // ★ お問い合わせ内容欄の入力チェック
        // 入力欄が取得できない状態（つまり空欄）の場合、
        // 該当箇所のアラートを表示
        // 空欄じゃなくなったらアラートを非表示
        if (!$("#textarea").val()) {
            $("#textareaSection .alert").show();
            sendFlag = false;
        } else {
            $("#textareaSection .alert").hide();
        }

        // ★ 年代選択欄のチェック
        // ユーザーの選択結果を取得して、
        // それが「none」だったら
        // 該当箇所のアラートを表示（それ以外であれば非表示）
        if ($("#age").val() == "none") {
            $("#ageSection .alert").show();
            sendFlag = false;
        } else {
            $("#ageSection .alert").hide();
        }

        // ★ 問い合わせ種別欄＆日時選択欄の選択チェック
        // チェックの個数を調べて変数に格納
        let radioCount = $("#contact_typeSection input:checked").length;

        // チェックの個数が０だったら
        // 該当箇所のアラートを表示（それ以外なら非表示）
        if (radioCount < 1) {
            $("#contact_typeSection .alert").show();
            sendFlag = false;
        } else {
            $("#contact_typeSection .alert").hide();
        }

        let radioCount1 = $("#dateSection input:checked").length;

        if (radioCount1 < 1) {
            $("#dateSection .alert").show();
            sendFlag = false;
        } else {
            $("#dateSection .alert").hide();
        }

        if (sendFlag == false) {
            $(".error2").show();
            $("html, body").animate({
                scrollTop: 0
            }, 400);
            return false;
        } else {
            $(".error2").hide();
        }
        // 送信判定の旗としての変数sendFlagがfalseだったら
        // 送信機能をoffにする(trueなら送信させる)
    })

});
