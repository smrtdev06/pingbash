/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Validation for MayaIQ Backend
 */
const Joi = require('@hapi/joi')

const registerValidation = (data) => {
    const schema = Joi.object({

        Name: Joi.string()
            .min(3)
            .required(),

        Email: Joi.string()
            .email()
            .required(),

        Password: Joi.string()
            .min(6)
            .required(),

        // Profession: Joi.string()
        //     .required(),

        // Address: Joi.string()
        //     .max(10000)
        //     .required(),

        // Geometry: Joi.object() // Validate as JSON object
        //     .keys({
        //         lat: Joi.number().required(), // Validate lat as a number
        //         lng: Joi.number().required() // Validate lng as a number
        //     })
        //     .required(),

        // Role: Joi.number()
        //     .required(),
        // country: Joi.string()
        //     .default(null),
        // gender: Joi.string()
        //     .default(null),
        // birthday: Joi.date()
        //     .max(new Date())
        //     .default(null),

        // Update further is any fields added to UserModel.js
    })

    return schema.validate(data)
}

const loginValidation = (data) => {
    const schema = Joi.object({
        Email: Joi.string()
            .email()
            .required(),

        Password: Joi.string()
            .min(6)
            .required(),
        Role: Joi.number()
            .required()
    })

    return schema.validate(data)
}

const confirmValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),

        otp: Joi.number()
            .required()
    })

    return schema.validate(data)
}

const resendEmailVailidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
    })

    return schema.validate(data)
}

const newPassValidation = (data) => {
    const schema = Joi.object({
        newPass: Joi.string()
            .required(),

        confirmPass: Joi.string()
            .required(),

        email: Joi.string()
            .email()
            .required(),
    })

    return schema.validate(data)
}

const getSignUpValidation = (data) => {
    const schema = Joi.object({
        Role: Joi.number()
            .required()
    })

    return schema.validate(data)
}

const getGroupCreatingValidation = (data) => {    
    const schema = Joi.object({
        groupName: Joi.string()
            .required(),
        createrId: Joi.number()
            .required(),
        size_mode: Joi.string(),
        frame_width: Joi.number(),
        frame_height: Joi.number(),
        bg_color:  Joi.string(),
        title_color:  Joi.string(),
        msg_bg_color:  Joi.string(),
        msg_txt_color:  Joi.string(),
        reply_msg_color:  Joi.string(),
        msg_date_color: Joi.string(),
        input_bg_color: Joi.string(),
        show_user_img: Joi.boolean(),
        custom_font_size: Joi.boolean(),
        font_size: Joi.number(),
        round_corners: Joi.boolean(),
        corner_radius: Joi.number(),
        chat_rules: Joi.string().allow('').default(''),
        show_chat_rules: Joi.boolean().default(false)

    })
    return schema.validate(data)
}

const getUpsertOptionValidation = (data) => {    
    const schema = Joi.object({
        user_id: Joi.number()
            .required(),
        sound_option: Joi.number()
            .required(),
    })
    return schema.validate(data)
}


const getDashboardListValidation = (data) => {
    const schema = Joi.object({
        Role: Joi.number()
            .required(),
        UserId: Joi.number()
            .required()
    })

    return schema.validate(data)
}

const updateCustomerInforValidation = (data) => {
    const schema = Joi.object({

        FirstName: Joi.string()
            .required(),

        LastName: Joi.string()
            .required(),

        Email: Joi.string()
            .email()
            .required(),

        description: Joi.string()
            .default(null),
        
        country: Joi.string()
            .default(null),

        gender: Joi.string()
            .default(null),
            
        birthday: Joi.date()
            .max(new Date()),
    })
    return schema.validate(data)
}

const updateCustomerPasswordValidation = (data) => {
    const schema = Joi.object({

        CurrentPassword: Joi.string()
            .required(),

        NewPassword: Joi.string()
            .required(),
    })
    return schema.validate(data)
}

const updateVendorInforValidation = (data) => {
    const schema = Joi.object({

        FirstName: Joi.string()
            .required(),

        LastName: Joi.string()
            .required(),

        Profession: Joi.string()
            .required(),

        Description: Joi.string()
            .required(),

        Email: Joi.string()
            .email()
            .required(),

        LocationType: Joi.string()
            .required(),

        Address: Joi.string()
            .required(),

        Geometry: Joi.object() // Validate as JSON object
            .keys({
                lat: Joi.number().required(), // Validate lat as a number
                lng: Joi.number().required() // Validate lng as a number
            })
            .required(),
        Role: Joi.number()
            .required()
    })
    return schema.validate(data)
}

const addProductsValidation = (data) => {
    const schema = Joi.object({

        Product_Name: Joi.string()
            .required(),

        Price: Joi.string()
            .required()
    })
    return schema.validate(data)
}

const updateProductsValidation = (data) => {
    const schema = Joi.object({
        Id: Joi.string()
            .required(),

        Product_Name: Joi.string()
            .required(),

        Price: Joi.string()
            .required(),
        Image: Joi.binary() 
            .allow(null)
    })
    return schema.validate(data)
}

const getProfileDatailValidation = (data) => {
    const schema = Joi.object({
        User_Id: Joi.number()
            .required()
    })
    return schema.validate(data)
}

const getProductsValidation = (data) => {
    const schema = Joi.object({
        Id: Joi.number()
            .required(),
    })
    return schema.validate(data)
}

module.exports = {
    confirmValidation,
    registerValidation,
    loginValidation,
    newPassValidation,
    getSignUpValidation,
    getDashboardListValidation,
    getGroupCreatingValidation,
    resendEmailVailidation,
    updateCustomerInforValidation,
    updateCustomerPasswordValidation,
    updateVendorInforValidation,
    updateProductsValidation,
    addProductsValidation,
    getProfileDatailValidation,
    getProductsValidation,
    getUpsertOptionValidation
}