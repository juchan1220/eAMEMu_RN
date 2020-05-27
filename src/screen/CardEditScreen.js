import React from 'react';
import {
    View,
    Text,
    StatusBar,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    findNodeHandle,
    Alert,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    TextInput,
} from 'react-native';
import update from 'react-addons-update';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import CardConv from '../module/CardConv';
import i18n from 'i18n-js';

class CardPreview extends React.Component {
    render() {
        let cardContent = (
            <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:8}}>
                <View style={{flex: 1,}}>
                    <TouchableOpacity style={{flex: 1}}>
                        <Text style={{position: 'absolute', top: 20, left: 20, fontSize: 17, fontWeight:'bold', color:'#ffffff'}}>
                            {this.props.name}
                        </Text>
                        <View style={{flex: 1, justifyContent:'center', paddingTop: 20,}}>
                            <Text style={{paddingTop: 0, textAlign: 'center', alignSelf: 'center', color: '#E0E0E0', fontSize: 14 }}>
                                {this.props.uid ?
                                    this.props.uid.substr(0,4)+'-'+this.props.uid.substr(4,4)+'-'+this.props.uid.substr(8,4)+'-'+this.props.uid.substr(12,4)
                                    : ''
                                }
                            </Text>
                            <Text style={{paddingTop: 8, textAlign: 'center', alignSelf: 'center', fontSize: 24, color:'#FAFAFA', fontWeight: '500', letterSpacing:-0.5}}>
                                {i18n.t('card_touch_to_enable')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{height: 1, backgroundColor: '#FAFAFA'}}/>
                <View style={{height: 48, flexDirection: 'row'}}>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{fontSize: 14, color:'#FAFAFA'}}>{i18n.t('card_edit')}</Text>
                    </TouchableOpacity>
                    <View style={{width: 1, backgroundColor: '#FAFAFA'}}/>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{fontSize: 14, color:'#ffffff'}}>{i18n.t('card_delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
        return (
            <View style={[{
                borderRadius: 8,
                height: this.props.cardHeight,
                marginTop: 16,
                justifyContent: 'center',
            },]}>
                {this.props.image ? (
                    <ImageBackground
                        source={{uri: this.props.image}}
                        style={{
                            flex: 1,
                            resizeMode:'contain',
                        }}
                        blurRadius={2}
                        borderRadius={8}>
                        {cardContent}
                    </ImageBackground>
                ) : (
                    <View
                        style={{
                            flex: 1,
                            resizeMode:'contain',
                            backgroundColor: '#03A9F4',
                        }}
                        blurRadius={2}
                        borderRadius={8}>
                        {cardContent}
                    </View>
                )}
            </View>
        );
    }
}

class ETextInput extends React.Component {
    state = {
        focused: false,
        value: this.props.value ?? '',
    };

    onFocusCallback(){
        this.setState({focused: true});
        if(typeof this.props.onFocus === 'function')
            this.props.onFocus();
    }

    onBlurCallback(){
        this.setState({focused: false});
        if(typeof this.props.onBlur === 'function')
            this.props.onBlur();
    }

    onChangeTextCallback(text){
        if(typeof this.props.filter === 'function')
            text = this.props.filter(text);
        if(typeof this.props.onChangeText === 'function')
            this.props.onChangeText(text);
    }

    focus(){
        this.textInput.focus();
    }

    render() {
        return (
            <View style={this.props.style}>
                <Text style={[{fontSize: 14,
                    color: this.props.error ? '#F44336' : this.state.focused ? '#03A9F4' : '#9E9E9E',
                    fontWeight: 'bold',
                }, this.props.titleStyle]}>
                    {this.props.title}
                </Text>

                <TextInput
                    style={[{fontSize: 17, paddingTop: 4,}, this.props.textStyle]}
                    value={this.props.value}
                    onFocus={() => this.onFocusCallback()}
                    onBlur={() => this.onBlurCallback()}
                    onChangeText={text => this.onChangeTextCallback(text)}
                    editable={this.props.editable}
                    maxLength={this.props.maxLength}
                    autoCapitalize={this.props.autoCapitalize}
                    ref={ref => this.textInput = ref}
                >
                </TextInput>
                <View style={{
                    paddingTop: 2,
                    height: this.state.focused ? 2 : 1,
                    backgroundColor: this.props.error ? '#F44336' : this.state.focused ? '#03A9F4' : '#9E9E9E',
                    opacity: this.props.editable ? 1 : 0.5,
                }}/>
            </View>
        )
    }
}

class CardEditScreen extends React.Component {
    state = {
        name: this.props.navigation.getParam('name', ''),
        sidAll: this.props.navigation.getParam('sid', '02FE'),
        sid2: '',
        sid3: '',
        sid4: '',
        uid: '',
        sidError: false,

        image: this.props.navigation.getParam('image', ''),
        index: this.props.navigation.getParam('index', null), // null 이면 카드 새로 생성
        mode: '',

        update: this.props.navigation.getParam('update', null),

        cardFocused: 'false',
    }

    componentDidMount(): void {
        let {height, width} = (Dimensions.get('window'));

        function randomHex4Byte(){
            let hexString = Math.min(Math.floor(Math.random() * 65536), 65535).toString(16);

            if(hexString.length < 4)
                hexString = '0'.repeat(4 - hexString.length) + hexString;

            return hexString.toUpperCase();
        }


        if(this.state.index === null){
            this.setState({mode: 'add', sid2: randomHex4Byte(), sid3: randomHex4Byte(), sid4: randomHex4Byte(), cardHeight:  (width - 48) * 53.98 / 85.60,},
                 () => this.updateSID());
        }
        else{
            this.setState({
                mode: 'edit',
                sid2: this.state.sidAll.substr(4, 4),
                sid3: this.state.sidAll.substr(8, 4),
                sid4: this.state.sidAll.substr(12, 4),
                cardHeight: (width - 48) * 53.98 / 85.60,
            },  () => {
                this.updateSID();
            });
        }

        this.nameInput.focus();
    }

    makeSid(){
        let sid = '02FE' + this.state.sid2 + this.state.sid3 + this.state.sid4;
        sid = sid.toUpperCase();
        if(sid.length !== 16){
            return '';
        }
        if(sid.replace(/[^0-9A-F]/g, '') !== sid){
            return '';
        }

        return sid;
    }

    async updateSID(){
        if(this.makeSid() !== ''){
            let uid = await CardConv.convertSID(this.makeSid());
            this.setState({uid: uid});
        }
    }

    saveCard(){
        let sid = this.makeSid();

        if(sid === ''){
            this.setState({sidError: true});
            return ;
        }

        if(typeof this.state.update === 'function'){
            this.state.update(this.state.name, sid, this.state.index, this.state.image, this.props.navigation);
        }
    }

    setRandomSid(){
        function randomHex4Byte(){
            let hexString = Math.min(Math.floor(Math.random() * 65536), 65535).toString(16);

            if(hexString.length < 4)
                hexString = '0'.repeat(4 - hexString.length) + hexString;

            return hexString.toUpperCase();
        }

        this.setState({sid2: randomHex4Byte(), sid3: randomHex4Byte(), sid4: randomHex4Byte()}, () => this.updateSID());
    }

    selectPhoto(){
        ImagePicker.openPicker({
            cropping: true,
            width: 856,
            height: 540,
            mediaType: 'photo',
        }).then(res => {
            if(res && res.path){
                this.setState({image: res.path,});
            }
        });
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, paddingTop: StatusBar.currentHeight}}>
                <StatusBar
                    barStyle='dark-content'
                    translucent={true}
                    backgroundColor={'#ffffff'}
                />
                <KeyboardAvoidingView style={{flex: 1,}}>
                    <View style={{
                        height: 48,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff'
                    }}>
                        <View style={{flex: 1, alignItems: 'center',
                            justifyContent: 'center',}}>
                            <Text style={{
                                fontSize: 17,
                                fontWeight: 'bold',
                                textAlignVertical: 'center',
                            }}>
                                {this.state.mode === 'add' ? i18n.t('header_add') : i18n.t('header_edit')}
                            </Text>

                            <TouchableOpacity style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onPress={() => this.saveCard()}
                            >
                                <Icon name='save' size={26} color={'rgba(0,0,0,0.7)'}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView style={{flex: 1, paddingHorizontal: 24, paddingTop: 16,}}>
                        <ETextInput title={i18n.t('edit_name')} value={this.state.name} onChangeText={text => this.setState({name: text})} ref={ref => this.nameInput = ref}/>
                        <TouchableOpacity onPress={() => this.selectPhoto()}>
                            <ETextInput style={{marginTop: 24,}} title={i18n.t('edit_background')} value={this.state.image ? i18n.t('edit_background_selected') :  i18n.t('edit_background_empty')} editable={false}/>
                        </TouchableOpacity>

                        <View style={{marginTop: 24, flexDirection: 'row'}}>
                            <ETextInput title={'SID'} value={'02FE'} onChangeText={text => this.setState({sid: text})}
                                        style={{flex: 1,}}
                                        editable={false}
                                        error={this.state.sidError}
                                        textStyle={{textAlign:'center',}}
                                        titleStyle={this.state.sidError !== true && this.state.sidFocus && {color: '#03A9F4'}}
                            />
                            <Text style={{width: 20, marginTop: 24, alignSelf: 'center', textAlign:'center',  color: '#9E9E9E', fontSize: 14,}}>-</Text>
                            <ETextInput
                                textStyle={{textAlign:'center',}}
                                value={this.state.sid2}
                                onChangeText={text => {this.setState({sid2: text}, () => this.updateSID()); if(text.length === 4) this.sid3Input.focus(); }}
                                style={{flex: 1,}}
                                maxLength={4}
                                error={this.state.sidError}
                                onFocus={() => this.setState({sidFocus: true})}
                                onBlur={() => this.setState({sidFocus: false})}
                                autoCapitalize={'characters'}
                                ref={ref => this.sid2Input = ref}
                                editable={false}
                            />
                            <Text style={{width: 20, marginTop: 24, alignSelf: 'center', textAlign:'center',  color: '#9E9E9E', fontSize: 14,}}>-</Text>
                            <ETextInput
                                textStyle={{textAlign:'center',}}
                                value={this.state.sid3}
                                onChangeText={text => {this.setState({sid3: text}, () => this.updateSID()); if(text.length === 4) this.sid4Input.focus();}}
                                style={{flex: 1,}}
                                maxLength={4}
                                error={this.state.sidError}
                                onFocus={() => this.setState({sidFocus: true})}
                                onBlur={() => this.setState({sidFocus: false})}
                                autoCapitalize={'characters'}
                                ref={ref => this.sid3Input = ref}
                                editable={false}
                            />
                            <Text style={{width: 20, marginTop: 24, alignSelf: 'center', textAlign:'center',  color: '#9E9E9E', fontSize: 14,}}>-</Text>
                            <ETextInput
                                textStyle={{textAlign:'center',}}
                                value={this.state.sid4}
                                onChangeText={text => {this.setState({sid4: text}, () => this.updateSID()); this.updateSID();}}
                                style={{flex: 1,}}
                                error={this.state.sidError}
                                maxLength={4}
                                onFocus={() => this.setState({sidFocus: true})}
                                onBlur={() => this.setState({sidFocus: false})}
                                autoCapitalize={'characters'}
                                ref={ref => this.sid4Input = ref}
                                editable={false}
                            />
                        </View>
                        <Text style={{marginTop: 8, fontSize: 14, letterSpacing: -0.4, color: this.state.sidError ? '#F44336' : '#9E9E9E'}}>
                            {i18n.t('edit_sid_notice')}
                        </Text>
                        <TouchableOpacity style={{marginTop: 24, height: 48, backgroundColor: '#03A9F4', borderRadius:8, alignItems:'center', justifyContent:'center',}}
                            onPress={() => this.setRandomSid()}
                        >
                            <Text style={{fontSize: 17, color: '#ffffff', fontWeight: '500'}}>{i18n.t('edit_random')}</Text>
                        </TouchableOpacity>

                        <Text style={{fontSize: 14, color: '#9E9E9E', marginTop: 20, fontWeight: 'bold'}}>{i18n.t('edit_preview')}</Text>
                        <CardPreview name={this.state.name} uid={this.state.uid} image={this.state.image} cardHeight={this.state.cardHeight ?? 0}/>

                        <View style={{height: 50}}/>
                        </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        )
    }
}

export default CardEditScreen;
