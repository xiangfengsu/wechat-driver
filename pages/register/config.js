export default {
    base: [{
            key: 'name',
            title: '姓名',
            placeholder: '请输入姓名',
            inputType: 'text',
            maxlength: -1,
            value: ''
        },
        {
            key: 'idcardno',
            title: '身份证号',
            placeholder: '请输入身份证号码',
            inputType: 'idcard',
            maxlength: 18,
            value: ''
        },
        {
            key: 'platenumber',
            title: '车牌号码',
            placeholder: '请输入车牌号',
            inputType: 'text',
            maxlength: -1,
            value: ''
        },
        {
            key: 'companyName',
            title: '所属公司',
            placeholder: '请输入您的公司',
            inputType: 'text',
            maxlength: -1,
            value: ''
        },
        {
            key: 'province',
            title: '省份',
            value: '',
            hidden:true
        },
        {
            key: 'city',
            title: '城市',
            value: '',
            hidden:true
        },
        {
            key: 'driverFrontUrl',
            title: '驾驶证',
            value:'',
            hidden:true
        },
        {
            key: 'travelFrontUrl',
            title: '行驶证',
            value:'',
            hidden:true
        },
        {
            key: 'certificateUrl',
            title: '运营许可证',
            value:'', 
            hidden:true
        },
        {
            key: 'carPhotoUrl',
            title: '人车照',
            value: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3120507481,1878382528&fm=27&gp=0.jpg',
            hidden:true
        },
    ],
    
}