(() => {
    "use strict";
    var __webpack_exports__ = {};

    function deleteItemAjax(url, header) {
        var callFunction = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
        $.ajax({
            url,
            type: "DELETE",
            dataType: "json",
            success: function success(obj) {
                obj.success && window.livewire.emit("refresh"), swal({
                    title: Lang.get("messages.common.deleted"),
                    text: header + Lang.get("messages.common.has_been_delete"),
                    type: "success",
                    confirmButtonText: Lang.get("messages.common.ok"),
                    confirmButtonColor: "#6777EF",
                    timer: 2e3
                }), callFunction && eval(callFunction)
            },
            error: function (e) {
                console.log(e);
                swal({
                    title: "",
                    text: e.responseJSON.message,
                    type: "error",
                    confirmButtonColor: "#6777ef",
                    timer: 5e3
                })
            }
        })
    }
    $(document).ready((function () {
        $("#memberStatus").select2()
    })), $(document).on("change", "#memberStatus", (function () {
        window.livewire.emit("filterStatus", $(this).val())
    })), 

$("#fromDate, #toDate").on("change", function () {
            let fromDate = $("#fromDate").val();
            let toDate = $("#toDate").val();
            window.livewire.emit("filterByDate", {
                fromDate: fromDate,
                toDate: toDate,
            });
        });

$('#exportCsv').on('click', function() {
alert("hii");
        window.livewire.emit('exportCsv');
    });
$(document).on("change", "#branchFilter", function() {
        let branchId = $(this).val(); // Get the selected branch ID
        window.livewire.emit('filterByBranch', branchId); // Emit the Livewire event with the selected branch ID
    });
$(document).on("mouseenter", ".livewire-card", (function () {
        $(this).find(".action-dropdown").removeClass("d-none")
    })), $(document).on("mouseleave", ".livewire-card", (function () {
        $(this).find(".action-dropdown").addClass("d-none"), $(this).parent().trigger("click")
    })), window.sendVerificationEmail = function (e) {
        $.ajax({
            url: e,
            type: "post",
            beforeSend: function () {
                startLoader()
            },
            success: function (e) {
                e.success && (swal({
                    title: "Success!",
                    text: e.message,
                    type: "success",
                    confirmButtonColor: "#6777EF",
                    timer: 2e3
                }), window.livewire.emit("refresh"))
            },
            error: function (e) {
                manageAjaxErrors(e)
            },
            complete: function () {
                stopLoader(), $(".email-btn").html('<i class="fas fa-sync font-size-12px"></i>')
            }
        })
    }, $(document).on("click", ".delete-btn", (function (e) {
        var t = $(e.currentTarget).data("id"),
            n = '<div class="alert alert-warning swal__alert">\n<strong class="swal__text-warning">' + Lang.get("messages.member.delete_member_confirm") + '</strong><div class="swal__text-message">' + Lang.get("messages.member.by_deleting_this_member") + "</div></div>";
        deleteItemInputConfirmation(route("members.destroy", t), Lang.get("messages.lead.member"), n)
    })), $(document).on("click", ".email-btn", (function (e) {
        $(this).html('<i class="fas fa-sync font-size-12px fa-spin"></i>');
        var t = $(e.currentTarget).attr("data-id");
        sendVerificationEmail(route("email-send", t))
    })), $(document).on("change", ".is-administrator", (function (e) {
        var t = $(e.currentTarget).attr("data-id");
        activeDeActiveAdministrator(t)
    })), window.activeDeActiveAdministrator = function (e) {
        $.ajax({
            url: route("members.active.deactive", e),
            method: "post",
            cache: !1,
            beforeSend: function () {
                startLoader()
            },
            success: function (e) {
                e.success && window.livewire.emit("refresh")
            },
            error: function (e) {
                displayErrorMessage(e.responseJSON.message), setTimeout(location.reload(!0), 700)
            },
            complete: function () {
                stopLoader()
            }
        })
    }, window.deleteItemInputConfirmation = function (e, t, n) {
        swal({
            type: "input",
            inputPlaceholder: deleteConfirm + ' "' + deleteWord + '" ' + toTypeDelete + " " + t + ".",
            title: deleteHeading + " !",
            text: n,
            html: !0,
            showCancelButton: !0,
            closeOnConfirm: !1,
            showLoaderOnConfirm: !0,
            confirmButtonColor: "#6777ef",
            cancelButtonColor: "#d33",
            cancelButtonText: noMessages,
            confirmButtonText: yesMessages,
            imageUrl: baseUrl + "img/warning.png"
        }, (function (n) {
            return !1 !== n && ("" == n || "delete" != n.toLowerCase() ? (swal.showInputError('Please type "delete" to delete this ' + t + "."), $(".sa-input-error").css("top", "23px!important"), $(document).find(".sweet-alert.show-input :input").val(""), !1) : void ("delete" === n.toLowerCase() && deleteItemAjax(e, t, null)))
        }))
    }, $(document).on("click", ".email-verify-btn", (function (e) {
        var t = $(e.currentTarget).attr("data-id");
        emailVerified(route("email-verify", t))
    })), window.emailVerified = function (e) {
        $.ajax({
            url: e,
            method: "post",
            beforeSend: function () {
                startLoader()
            },
            success: function (e) {
                e.success && location.reload(!0)
            },
            error: function (e) {
                manageAjaxErrors(e)
            },
            complete: function () {
                stopLoader(), $(".email-verified-btn").html('<i class="fas fa-mail-bulk font-size-12px"></i>')
            }
        })
    }
})();