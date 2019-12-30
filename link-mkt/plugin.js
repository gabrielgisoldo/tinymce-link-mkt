tinymce.PluginManager.add('link-mkt', function(editor, url) {
    var init_data = {}, settings = {
        /*
        URL_WRAPPER

        String to wrap any of the attributes on default_link. You can use flags like %attribute% to replace inside your string.
        This is used as the a[href] value
        Egg: 'my_string_with_my_href=%href%' would result in 'my_string_with_my_href=anything_you_passed_as_link_to_the_dialog'
        */
        url_wrapper: (editor.settings.link_wrapper)? editor.settings.link_wrapper:'',
    }

    var isEmptyObject = function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)) return false;
        }
        return true
    }

    var rgb2hex = function(str){
        if(str.match(new RegExp(/^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)/g))){
            // It's a RGB string
            return '#' + str.match(new RegExp(/\d{1,3}/g)).map(
                function(x){
                    x = parseInt(x).toString(16);
                    return (x.length==1) ? "0"+x : x;
                }
            ).join('')
        } else if(str.match(/^#[a-zA-Z0-9]{3,6}/g)){
            // Already a HEX string
            return str
        } else {
            // No fucking idea wtf is this.
            throw 'WTF is this!'
        }
    }

    var Anchor = function(node){
        this.node = node !== undefined ? node : editor.dom.create('a')
        this.default = {
            href: '',
            title: '',
            target: '',
            rel: '',
            dataurl: '',
            type: ''
        }

        for (var i in this.default){
            this[i] = (this.node.getAttribute(i) !== undefined && this.node.getAttribute(i)) ? this.node.getAttribute(i) : this.default[i]
        }
    };

    Anchor.prototype.formatLink = function(){
        if (settings.url_wrapper){
            temp = settings.url_wrapper
            to_rep = settings.url_wrapper.match(new RegExp(/%\w+%/g));
            for (var i = 0; i < to_rep.length; i++) {
                attr = to_rep[i].split("%").join("")
                temp = temp.replace(to_rep[i], (this[attr])?this[attr]:'')
            }
            this.href = temp
        } else {
            this.href = this.dataurl
        }
    }

    Anchor.prototype.makeTab = function(){
        return {
            name: 'tab_url',
            title: 'Link',
            items: [
                {
                    type: 'input',
                    name: 'href',
                    label: 'URL:'
                },
                {
                    type: 'input',
                    name: 'title',
                    label: 'Title:'
                },
                {
                    type: 'selectbox',
                    name: 'target',
                    label: 'Open link on...',
                    items: [
                        {value: '_blank', text: 'New Window'},
                        {value: '', text: 'Actual Window'}
                    ]
                }
            ]
        }
    };

    Anchor.prototype.makeInit = function(){
        init_data.href = this.dataurl
        init_data.title = this.title
        init_data.target = this.target
    };

    Anchor.prototype.getHTML = function(str){
        this.node.href = this.href
        this.node.title = this.title
        this.node.target = this.target
        this.node.rel = this.rel
        this.node.type = this.type
        this.node.setAttribute('dataurl', this.dataurl)

        if(str){
            return this.node.outerHTML
        } else {
            return this.node
        }
    }

    Anchor.prototype.update = function(data){
        for (var i in data){
            if(this[i] !== undefined)this[i] = data[i]
        }

        if(this.target == '_blank'){
            this.rel = 'noopener noreferer'
        }

        this.dataurl = this.href
    }

    Anchor.prototype.setChildren = function(node){
        this.node.innerHTML = ""
        this.node.appendChild(node)
    }

    Anchor.prototype.getChildren = function(node){
        return this.node.childNodes[0]
    }

    Anchor.prototype.checkURL = function(){
        if(this.href){
            try{new URL(this.href)}
            catch{return false}
        }
        return true
    }

    var Image = function(node){
        this.node = node !== undefined ? node : editor.dom.create('img')
        this.default = {
            src: '',
            style: ''
        }

        for (var i in this.default){
            this[i] = (this.node.getAttribute(i) !== undefined && this.node.getAttribute(i)) ? this.node.getAttribute(i) : this.default[i]
        }
    };

    Image.prototype.makeTab = function(){
        return {
            name: 'tab_url_conf_img',
            title: 'Image',
            items: [
                {
                    type: 'input',
                    name: 'src',
                    label: 'Image source link:'
                }
            ]
        }
    };

    Image.prototype.makeInit = function(){
        init_data.src = this.src
    };

    Image.prototype.getHTML = function(str){
        this.node.src = this.src
        this.node.style = this.style

        if(str){
            return this.node.outerHTML
        } else {
            return this.node
        }
    }

    Image.prototype.update = function(data){
        for (var i in data){
            if(this[i] !== undefined) this[i] = data[i]
        }
    }

    Image.prototype.checkURL = function(){
        if(this.src){
            try{new URL(this.src)}
            catch{return false}
        }
        return true
    }

    var Button = function(node){
        this.node = node !== undefined ? node : editor.dom.create('span')
        this.default = {
            btnText: 'Button',
            innerText: '',
            btnBgcolor: "#FFF",
            btnColor: "#000",
            btnBorderSize: '1px',
            btnBorderColor: '#000',
            btnBorderRadius: '40px',
            btnDisplay: 'inline-block',
            btnPadding: '10px',
            btnFontWeight: 'bold',
            btnTextDecoration: 'none',
            btnBorderStyle: 'solid',
            btnCursor: 'pointer'
        }

        this.innerText = (this.node.innerText !== undefined && this.node.innerText)? this.node.innerText : this.default.innerText
        this.btnBgcolor = (this.node.style.backgroundColor !== undefined && this.node.style.backgroundColor)? rgb2hex(this.node.style.backgroundColor) : this.default.btnBgcolor
        this.btnColor = (this.node.style.color !== undefined && this.node.style.color)? rgb2hex(this.node.style.color) : this.default.btnColor
        this.btnBorderSize = (this.node.style.borderWidth !== undefined && this.node.style.borderWidth)? this.node.style.borderWidth : this.default.btnBorderSize
        this.btnBorderColor = (this.node.style.borderColor !== undefined && this.node.style.borderColor)? rgb2hex(this.node.style.borderColor) : this.default.btnBorderColor
        this.btnBorderRadius = (this.node.style.borderRadius !== undefined && this.node.style.borderRadius)? this.node.style.borderRadius : this.default.btnBorderRadius
        this.btnDisplay = (this.node.style.display !== undefined && this.node.style.display)? this.node.style.display : this.default.btnDisplay
        this.btnPadding = (this.node.style.padding !== undefined && this.node.style.padding)? this.node.style.padding : this.default.btnPadding
        this.btnFontWeight = (this.node.style.fontWeight !== undefined && this.node.style.fontWeight)? this.node.style.fontWeight : this.default.btnFontWeight
        this.btnTextDecoration = (this.node.style.textDecoration !== undefined && this.node.style.textDecoration)? this.node.style.textDecoration : this.default.btnTextDecoration
        this.btnBorderStyle = (this.node.style.borderStyle !== undefined && this.node.style.borderStyle)? this.node.style.borderStyle : this.default.btnBorderStyle
        this.btnCursor = (this.node.style.cursor !== undefined && this.node.style.cursor)? this.node.style.cursor : this.default.btnCursor
        this.btnText = this.node.innerText
        this.btnRounded = (this.node.style.borderRadius)?true:false
        this.node = editor.dom.create('span')
    };

    Button.prototype.makeTab = function(){
        return {
            name: 'tab_url_conf_button',
            title: 'Button',
            items: [
                {
                    type: 'input',
                    name: 'btnText',
                    label: 'Text inside the button:'
                },
                {
                    type: 'htmlpanel',
                    html: '<div></div>'
                },
                {
                    type: 'label',
                    label: 'Customization',
                    items: [
                        {
                            type: 'htmlpanel',
                            html: '<div></div>'
                        },
                        {
                            type: 'colorinput',
                            name: 'btnBgcolor',
                            label: 'Background Color:'
                        },
                        {
                            type: 'colorinput',
                            name: 'btnColor',
                            label: 'Font Color'
                        },
                        {
                            type: 'input',
                            name: 'btnBorderSize',
                            label: 'Border Width:'
                        },
                        {
                            type: 'colorinput',
                            name: 'btnBorderColor',
                            label: 'Border color:'
                        },
                        {
                            type: 'checkbox',
                            name: 'btnBorderRadius',
                            label: 'Rounded Button',
                            disabled: false
                        }

                    ]
                }
            ]
        }
    };

    Button.prototype.makeInit = function(){
        init_data.btnText = this.btnText
        init_data.btnBgcolor = this.btnBgcolor
        init_data.btnColor = this.btnColor
        init_data.btnBorderSize = this.btnBorderSize
        init_data.btnBorderColor = this.btnBorderColor
        init_data.btnBorderRadius = (this.btnRounded)? true:false
    };

    Button.prototype.getHTML = function(str){
        this.node.innerText = this.btnText
        this.node.style.backgroundColor = this.btnBgcolor
        this.node.style.color = this.btnColor
        this.node.style.borderWidth = this.btnBorderSize
        this.node.style.borderColor = this.btnBorderColor
        this.node.style.display = this.btnDisplay
        this.node.style.padding = this.btnPadding
        this.node.style.fontWeight = this.btnFontWeight
        this.node.style.textDecoration = this.btnTextDecoration
        this.node.style.borderRadius = (this.btnBorderRadius)? '40px':''
        this.node.style.borderStyle = this.btnBorderStyle
        this.node.style.cursor = this.btnCursor

        if(str){
            return this.node.outerHTML
        } else {
            return this.node
        }
    }

    Button.prototype.update = function(data){
        for (var i in data){
            if(this[i] !== undefined) this[i] = data[i]
        }
    }

    var Text = function(node){
        this.node = node !== undefined ? node : editor.dom.create('span')
        this.default = {
            text: '',
            innerText: ''
        }

        for (var i in this.default){
            this[i] = (this.node[i] !== undefined && this.node[i]) ? this.node[i] : this.default[i]
        }

        this.text = this.innerText
    };

    Text.prototype.makeTab = function(){
        return {
            name: 'tab_url_conf_text',
            title: 'Texto',
            items: [
                {
                    type: 'input',
                    name: 'text',
                    label: 'Texto to show as link:'
                }
            ]
        }
    };

    Text.prototype.makeInit = function(){
        init_data.text = this.text
    };

    Text.prototype.getHTML = function(str){
        this.node.innerText = this.text
        this.node.style = this.style

        if(str){
            return this.node.outerHTML
        } else {
            return this.node
        }
    }

    Text.prototype.update = function(data){
        for (var i in data){
            if(this[i] !== undefined) this[i] = data[i]
        }
    }

    var CreateDialog = function(){
        // Empty init data
        init_data = {}
        tabs = []

        if (editor.selection.getNode().nodeName == 'A' || editor.selection.getNode().parentNode.nodeName == 'A'){
            console.log('Edit');
            anchor = new Anchor((editor.selection.getNode().nodeName == 'A')?editor.selection.getNode():editor.selection.getNode().parentNode)
            anchor.makeInit()
            tabs.push(anchor.makeTab())

            if(anchor.type == 'txt'){
                text = new Text(anchor.getChildren())
                text.makeInit()
                tabs.push(text.makeTab())
            } else if (anchor.type == 'img'){
                image = new Image(anchor.getChildren())
                image.makeInit()
                tabs.push(image.makeTab())
            }  else if (anchor.type == 'btn'){
                button = new Button(anchor.getChildren())
                button.makeInit()
                tabs.push(button.makeTab())
            }
            init_data.new = false
        } else {
            console.log('New');
            // create objects
            anchor = new Anchor()
            image = new Image()
            button = new Button()
            text = new Text()

            // Create 
            anchor.makeInit()
            text.makeInit()
            image.makeInit()
            button.makeInit()
            init_data.new = true

            // Insert tabs for each object
            tabs.push(anchor.makeTab())
            tabs.push(image.makeTab())
            tabs.push(button.makeTab())
            tabs.push(text.makeTab())
        }
        return getDialog(tabs, init_data)
    };

    var getDialog = function(tabs, init) {
        return {
            title: 'Insert/Edit Link',
            body: {
                type: 'tabpanel',
                tabs: tabs
            },
            buttons: [
                {
                    type: 'cancel',
                    text: 'Cancel'
                },
                {
                    type: 'submit',
                    text: 'Save',
                    primary: true
                }
            ],
            initialData: init,
            onSubmit: function(api){
                data = api.getData()
                if(data.src){data.type = 'img'}
                else if(data.btnText){data.type = 'btn'}
                else {data.type = 'txt'}
                anchor.update(data)

                if(!anchor.checkURL()){
                    createAlert('error', 'Link: Invalid URL.', 'warning')
                    throw 'Invalid URL'
                }

                anchor.formatLink()
                
                if (data.type == 'txt'){
                    if(data.text == ''){
                        data.text = anchor.dataurl
                    }
                    text.update(data)
                    anchor.setChildren(text.getHTML())
                } else if (data.type == 'img'){
                    image.update(data)

                    if(!image.checkURL()){
                        createAlert('error', 'Image: Invalid URL.', 'warning')
                        throw 'Invalid image URL'
                    }

                    anchor.setChildren(image.getHTML())
                }  else if (data.type == 'btn'){
                    console
                    button.update(data)
                    anchor.setChildren(button.getHTML())
                }
                if(!init_data.new){
                    if (editor.selection.getNode().nodeName == 'A') editor.dom.remove(editor.selection.getNode())
                    else editor.dom.remove(editor.selection.getNode().parentNode)
                }
                editor.insertContent(anchor.getHTML(true))

                editor.fire('input')

                api.close()
            }
        }
    }

    var createAlert = function(level, text, icon){
        //For informations on level of alert check: https://www.tiny.cloud/docs/ui-components/dialogcomponents/#alertbanner 
        //For informations on icons available check: https://www.tiny.cloud/docs/advanced/editor-icon-identifiers/
        editor.windowManager.open({
            title: '',
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'alertbanner',
                        level: (level)?level:'info',
                        text: (text)?text:'Default notification.',
                        icon: (icon)?icon:'notice'
                    }
                ]
            },
            buttons: [
                {
                    type: 'cancel',
                    text: 'OK',
                    primary: true
                }
            ]
        })
    }

    editor.ui.registry.addButton('link-mkt', {
        icon: 'link',
        tooltip: 'Insert/Edit Link',
        onAction: function(){
            editor.windowManager.open(CreateDialog())
        }
    })

    return {
        getMetadata: function(){
            return {
                name: 'link-mkt',
                url: 'https://github.com/gabrielgisoldo/tinymce-link-mkt/blob/master/plugin.js'
            }
        }
    }
})
