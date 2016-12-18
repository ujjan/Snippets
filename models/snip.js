    /**
     * Created by Ayaz on 2016-11-30.
     */
    var mongoose = require("mongoose");

    let snipSchema = mongoose.Schema({

        name: { type: String, required: true , trim: true},
        snippets: { type: String, required: true, trim: true, minlength: 1 }

    });



    var Snip = mongoose.model('Snip', snipSchema);

    module.exports = Snip;



    /*
        var Snip = mongoose.model('Snip', {
            name: {
                type: String,
                require: true,
                trim: true,
                minlength: 1

            },
            snippet:{
                type: String,
                required: true,
                trim: true,
                minlength: 1

            }
        });

        module.exports = {
            Snip: Snip
        };*/