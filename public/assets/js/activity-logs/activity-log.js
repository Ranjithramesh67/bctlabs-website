(() => {
  "use strict";
  var e;
  function a(e, a, t) {
    return (
      a in e
        ? Object.defineProperty(e, a, {
            value: t,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[a] = t),
      e
    );
  }
  var t = route("activity.logs.index"),
    s = route("change.filter");
  $(document).ready(function () {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
    var e = 1;
    $(window).scroll(function () {
      $(window).scrollTop() === $(document).height() - $(window).height() &&
        (!(function (e) {
          a ||
            ($(".load-more-logs").show(),
            $.ajax({
              url: t + "?page=" + e,
              type: "get",
              success: function (e) {
                if (e.success) {
                  var t,
                    o = "";
                  if (e.data.data.length > 0)
                    for (a = !1, t = 1; t < e.data.data.length; ++t) {
                      var r = [
                        {
                          created_at: s(e.data.data[t].created_at),
                          subject_type: n(e.data.data[t].subject_type),
                          created_by: e.data.data[t].created_by.full_name,
                          description: e.data.data[t].description,
                        },
                      ];
                      o += prepareTemplateRender("#activityLogsTemplate", r);
                    }
                  else
                    (a = !0),
                      $(".load-more-logs").hide(),
                      $(".no-found-more-logs").html("No more records found");
                  $(".activities").append(o);
                }
              },
              error: function (e) {
                manageAjaxErrors(e);
              },
            }));
        })(e),
        e++);
    });
    var a = !1;
    function s(e) {
      return moment(e).fromNow();
    }
    function n(e) {
      var a = e.substring(11);
      return "CustomerGroup" === a
        ? "fas fa-people-arrows"
        : "Customer" === a
        ? "fas fa-street-view"
        : "User" === a
        ? "fas fa-user"
        : "ArticleGroup" === a
        ? "fas fa-edit"
        : "Article" === a
        ? "fab fa-autoprefixer"
        : "Tag" === a
        ? "fas fa-tty"
        : "LeadStatus" === a
        ? "fas fa-blender-phone"
        : "LeadSource" === a
        ? "fas fa-globe"
        : "Lead" === a
        ? "fas fa-file-invoice"
        : "Project" === a
        ? "fas fa-layer-group"
        : "Task" === a
        ? "fas fa-tasks"
        : "TicketPriority" === a
        ? "fas fa-sticky-note"
        : "TicketStatus" === a
        ? "fas fa-info-circle"
        : "PredefinedReply" === a
        ? "fas fa-reply"
        : "Ticket" === a
        ? "fas fa-ticket-alt"
        : "Invoice" === a
        ? "fas fa-file-invoice"
        : "CreditNote" === a
        ? "fas fa-clipboard"
        : "Proposal" === a
        ? "fas fa-scroll"
        : "Estimate" === a
        ? "fas fa-calculator"
        : "Payment" === a
        ? "fas fa-money-check-alt"
        : "Department" === a
        ? "fas fa-columns"
        : "ExpenseCategory" === a
        ? "fas fa-list-ol"
        : "Expense" === a
        ? "fab fa-erlang"
        : "PaymentMode" === a
        ? "fab fa-product-hunt"
        : "TaxRate" === a
        ? "fas fa-percent"
        : "Announcement" === a
        ? "fas fa-bullhorn"
        : "Item" === a
        ? "fas fa-sitemap"
        : "ItemGroup" === a
        ? "fas fa-object-group"
        : "ContractType" === a
        ? "fas fa-file-contract"
        : "Contract" === a
        ? "fas fa-file-signature"
        : "Goal" === a
        ? "fas fa-bullseye"
        : "Service" === a
        ? "fab fa-stripe-s"
        : "Reminder" === a
        ? "fas fa-bell"
        : "Note" === a
        ? "fas fa-sticky-note"
        : "Comment" === a
        ? "fas fa-comment"
        : "Contact" === a
        ? "fas fa-user"
        : void 0;
    }
  });
  var n = $("#time_range"),
    o = moment(),
    r = o.clone().startOf("month"),
    f = o.clone().endOf("month"),
    m = moment().startOf("month").subtract(1, "days");
  // $(document).ready(function () {
  //   n.val(r.format("YYYY-MM-DD") + " - " + f.format("YYYY-MM-DD"));
  // }),
    (window.cb = function (e, a) {
      e._isValid && a._isValid
        ? n
            .find("span")
            .html(e.format("MMM D, YYYY") + " - " + a.format("MMM D, YYYY"))
        : (n.val(""), n.find("span").html(""));
    }),
    cb(r, f),
    n.daterangepicker(
      {
        startDate: r,
        endDate: f,
        opens: "left",
        showDropdowns: !0,
        autoUpdateInput: !1,
        locale: {
          customRangeLabel: "Custom",
          applyLabel: Lang.get("messages.common.apply"),
          cancelLabel: Lang.get("messages.common.cancel"),
          fromLabel: Lang.get("messages.common.from"),
          toLabel: Lang.get("messages.common.to"),
          monthNames: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
          daysOfWeek: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        ranges: {
          Today: [moment(), moment()],
          "This Week": [moment().startOf("week"), moment().endOf("week")],
          "Last Week": [
            moment().startOf("week").subtract(7, "days"),
            moment().startOf("week").subtract(1, "days"),
          ],
          "This Month": [r, f], // Assuming r and f are defined elsewhere
          "Last Month": [m.clone().startOf("month"), m.clone().endOf("month")], // Assuming m is defined elsewhere
        },
      },
      cb
    ),
    n.on("apply.daterangepicker", function (e, a) {
      a.startDate._isValid && a.endDate._isValid
        ? (function (e, a) {
            $.ajax({
              url: s,
              type: "post",
              data: { startDate: e, endDate: a },
              beforeSend: function () {
                startLoader();
              },
              success: function (e) {
                console.log(e.html);
                $(".activity-logs-data").html(e.html);
              },
              error: function (e) {
                displayErrorMessage(e.responseJSON.message);
              },
              complete: function () {
                stopLoader();
              },
            });
          })(a.startDate.format("YYYY-MM-DD"), a.endDate.format("YYYY-MM-DD"))
        : $(this).val("");
    });
})();
