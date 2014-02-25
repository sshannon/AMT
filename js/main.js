/*
    Last check changePage wasn't updating the hash correctly 
    and therefore not navigating to the result page. Not sure
    why this is.. apart from that I just need to draw up the
    results pages. It might also be useful to be able to see
    the various results pages right from the main index.
*/

(function() {

    var MyModel = Backbone.Model.extend();

    var HomeView = Backbone.View.extend({
        template:_.template($('#home').html()),

        render:function (eventName) {
            this.initialize();

            $(this.el).html(this.template());
            return this;
        }
    });

    var ResultView = Backbone.View.extend({
        template:null,

        render:function (template) {
            this.template = _.template(template.html());

            $(this.el).html(this.template());
            return this;
        }
    });

    var GeneralPracticeView = Backbone.View.extend({
        template:_.template($('#generalPractice').html()),

        router: null,

        initialize: function(){
            _.bindAll(this, 'render');
            _.bindAll(this, 'getFormData');

            this.router = this.options.router;
        },

        events: {
            'click #nextPage' : 'handleSubmit'
        },

        render:function (eventName) {
            $(this.el).html(this.template());
            return this;
        },

        handleSubmit: function(){
            this.getFormData();
            this.calculateSeverity();
        },

        getFormData: function(){
            this.model.set({
                PEF: $(this.el).find('#PEF').val(),
                SPO2: $(this.el).find('#SpO2').val(),
                Breaths: $(this.el).find('#Breaths').val(),
                Speech: $(this.el).find('#Speech').val(),
                Pulse: $(this.el).find('#pulse').val(),
                Arrhythmia: $(this.el).find('#arrhythmia').prop('checked'),
                Hypotension: $(this.el).find('#hypotension').prop('checked'),
                Exhaustion: $(this.el).find('#exhaustion').prop('checked'),
                AlteredConsciousness: $(this.el).find('#alteredConsciousness').prop('checked'),
            });
        },

        calculateSeverity: function(){
            if(this.model.get('SPO2') < 92 ||
               this.model.get('Speech') == 'Silent' || 
               this.model.get('Arrhythmia') ||
               this.model.get('Hypotension') ||
               this.model.get('Exhaustion') ||
               this.model.get('AlteredConsciousness'))
                //$.mobile.changePage('#immediateActionResult', {changeHash:true});
                location.hash = '#immediateAction';

            else if(this.model.get('Speech') == 'Laboured' ||
               this.model.get('Breaths') >= 25 ||
               this.model.get('Pulse') >= 110)
                //$.mobile.changePage('#considerAdmissionResult', {changeHash:true});
                location.hash = '#considerAdmission';

            else
                //$.mobile.changePage('#treatAtHomeResult', {changeHash:true});
                location.hash = '#treatAtHome';
        }
    });

    var AppRouter = Backbone.Router.extend({
        model: null,

        routes:{
            '':'home',
            'generalPractice':'generalPractice',

            'immediateAction':'immediateActionResult',
            'considerAdmission':'considerAdmissionResult',
            'treatAtHome':'treatAtHomeResult'
        },

        initialize:function () {
            // Handle back button throughout the application
            $('.back').on('click', function(event) {
                window.history.back();
                return false;
            });
            this.firstPage = true;

            this.model = new MyModel();
        },

        home:function () {
            console.log('#home');
            this.changePage(new HomeView({ model: this.model }));
        },

        generalPractice:function () {
            console.log('#generalPractice');
            this.changePage(new GeneralPracticeView({ 
                model: this.model,

                router: this
            }));
        },

        immediateActionResult: function(){
            this.changePageUsingTemplate(new ResultView(), $('#immediateActionResult'));
        },

        considerAdmissionResult: function(){
            this.changePageUsingTemplate(new ResultView(), $('#considerAdmissionResult'));
        },

        treatAtHomeResult: function(){
            this.changePageUsingTemplate(new ResultView(), $('#treatAtHomeResult'));
        },

        changePage:function (page) {
            $(page.el).attr('data-role', 'page');
            page.render();
            $('body').append($(page.el));
            var transition = $.mobile.defaultPageTransition;
            // We don't want to slide the first page
            if (this.firstPage) {
                transition = 'none';
                this.firstPage = false;
            }
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
        },

        changePageUsingTemplate:function (page, template) {
            $(page.el).attr('data-role', 'page');
            page.render(template);
            $('body').append($(page.el));
            var transition = $.mobile.defaultPageTransition;
            // We don't want to slide the first page
            if (this.firstPage) {
                transition = 'none';
                this.firstPage = false;
            }
            $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
        }

    });

    $(document).ready(function () {
        console.log('document ready');
        app = new AppRouter();
        Backbone.history.start();
    });

}).call(this);