module.exports = { 
    user:{ 
        username:{
            type: String, 
            unique: true,
            required: true
        },
        password:{
            type: Object,
            required: true
        }
    },
    message:{
    	username:{
            type: String,
            required: true
        },
    	createTime:{
            type: String,
            required: true
        },
    	content:{
            type: String,
            required: true
        }
    }
};