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
} from 'react-native';
import update from 'react-addons-update';
import Hcef from '../module/Hcef';
import CardConv from '../module/CardConv';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';


const RNFS = require('react-native-fs');

class Card extends React.Component {
    async onPress() {
        this.props.onPress(this.props.card, this.props.index);
    }

    async disable(){
        if(typeof this.props.disableCallback === 'function')
            this.props.disableCallback(this.props.card, this.props.index);
    }

    render() {

        let cardContent = (

            <View style={{flex: 1, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:8}}>
                <View style={{flex: 1,}}>
                    <TouchableOpacity style={{flex: 1}} onPress={this.onPress.bind(this)}>
                        <Text style={{position: 'absolute', top: 20, left: 20, fontSize: 17, fontWeight:'bold', color:'#ffffff'}}>
                            {this.props.card.name}
                        </Text>

                        <View style={{flex: 1, justifyContent:'center', paddingTop: 20,}}>
                            <Text style={{paddingTop: 0, textAlign: 'center', alignSelf: 'center', color: '#E0E0E0', fontSize: 14 }}>
                                {this.props.card.uid.substr(0,4)+'-'+this.props.card.uid.substr(4,4)+'-'+this.props.card.uid.substr(8,4)+'-'+this.props.card.uid.substr(12,4)}
                            </Text>
                            <Text style={{paddingTop: 8, textAlign: 'center', alignSelf: 'center', fontSize: 24, color:'#FAFAFA', fontWeight: '500', letterSpacing:-0.5}}>
                                {this.props.card.enabled ? '터치하여 비활성화' : '터치하여 활성화'}
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
                    }} onPress={() => this.props.navigation.navigate('CardEditScreen', {name: this.props.card.name, sid: this.props.card.sid, image: this.props.card.image, index: this.props.index, update: this.props.update})}>
                        <Text style={{fontSize: 14, color:'#FAFAFA'}}>편집</Text>
                    </TouchableOpacity>
                    <View style={{width: 1, backgroundColor: '#FAFAFA'}}/>
                    <TouchableOpacity style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} onPress={() => this.props.delete(this.props.index)}>
                        <Text style={{fontSize: 14, color:'#ffffff'}}>삭제</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
        return (
        <View style={[{
            borderRadius: 8,
            height: this.props.cardHeight,
            marginTop: 24,
            marginHorizontal: 24,
            justifyContent: 'center',
        },]}>
            {this.props.card.image ? (
                <ImageBackground
                source={{uri: this.props.card.image}}
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

class MainScreen extends React.Component {
    state = {
        cards: [],
        cardHeight: 1,
        support: false,
        history: {},
    };

    async loadCards(){
        let cardsJson = await AsyncStorage.getItem('cards');
        this.setState({cards: cardsJson ? JSON.parse(cardsJson) : []});
    }

    async loadHistory(){
        let historyJson = await AsyncStorage.getItem('history');
        this.setState({history: historyJson ? JSON.parse(historyJson) : {}});
    }

    componentDidMount(){
        this.prevCard = null;
        this.prevIndex = -1;
        this.loadCards();
        this.loadHistory();

        if(Hcef.support !== true){
            Alert.alert("이 기기는 지원하지 않습니다.", "이 기기는 앱을 실행하기 위해 필요한 기능을 가지고 있지 않습니다. 앱을 사용해도 카드를 에뮬레이션 할 수 없습니다.",
                [{text: '확인', onPress: () => {}}]);
        }
        else if(Hcef.enabled !== true){
            Alert.alert("NFC가 활성화 되어있지 않습니다.", "이 앱을 사용하기 위해서는 NFC가 필요합니다. 설정에서 NFC를 활성화하고 기본 NFC 설정이 존재한다면 안드로이드 운영체제 혹은 자동 선택으로 설정하고 앱을 재실행해주세요.");
        }

        if(Hcef.support && Hcef.enabled){
            Hcef.disableService(); // 카드를 활성화하지 않았는데도 카드가 에뮬되는 이슈 방지
        }

        let {height, width} = (Dimensions.get('window'));

        this.setState({
            cardHeight: (width - 48) * 53.98 / 85.60
        });
    }

    async switch(card, index){
        if(!Hcef.support || !Hcef.enabled) return;

        if(card.enabled === true)
            this.disable(card, index);
        else
            this.enable(card, index);
    }

    async enable(card, index){
        if(this.prevCard && this.prevCard.enabled) {
            await this.disable(this.prevCard, this.prevIndex);
        }

        let ret = false;
        let ret2 = false;

        ret = await Hcef.setSID(card.sid);
        if(ret){
            ret2 = await Hcef.enableService();
        }

        if(ret && ret2){
            this.prevCard = card;
            this.prevCard.enabled = true;
            this.prevIndex = index;
            this.setState({cards: update(this.state.cards, { [index]: { enabled: { $set: true } }})});
        }
    }

    async disable(card, index){
        if(card.enabled){
            let ret = await Hcef.disableService();
            if(ret){
                card.enabled = false;
                this.setState({cards: update(this.state.cards, { [index]: { enabled: { $set: false } }})});
                return true;
            }
        }
        return false;
    }

    async cardListUpdate(name, sid, index, image, navigation){
        let uid = await CardConv.convertSID(sid);
        let internalPath = '';

        if(image !== ''){
            internalPath = RNFS.DocumentDirectoryPath + '/' +  new Date().valueOf();

            if(image.startsWith('file://')){
                image = image.replace("file://",'');
            }

            await RNFS.copyFile(image, internalPath);

            internalPath = 'file://' + internalPath;
        }

        let remain = 5;

        let nowDate = new Date();
        let key = nowDate.getFullYear() + '-' + nowDate.getMonth() + '-' + nowDate.getDate();

        if(index === null || this.state.cards[index].sid !== sid){
            if(this.state.history[key] === undefined){
                this.state.history[key] = 1;
            }
            else if(this.state.history[key] < 5){
                this.state.history[key] += 1;
            }
            else{
                Alert.alert("", "오늘 생성할 수 있는 카드번호를 모두 생성했습니다. 나중에 다시 시도해주세요.",
                    [{text: '확인', onPress: () => {navigation.goBack();}}]);
                return ;
            }
        }

        remain = 5 - this.state.history[key] ;

        if(index === null){
            this.setState({cards: update(this.state.cards, { $push: [{name: name, sid: sid, uid: uid, image: internalPath}]})},
                async () => {
                    await AsyncStorage.setItem('cards', JSON.stringify(this.state.cards));
                    await AsyncStorage.setItem('history', JSON.stringify(this.state.history));
                });
        }
        else{
            this.setState({cards: update(this.state.cards, { [index]: { name: {$set: name}, sid: {$set: sid}, uid: {$set: uid}, image: {$set: internalPath} }})},
                async () =>{
                    await AsyncStorage.setItem('cards', JSON.stringify(this.state.cards));
                    await AsyncStorage.setItem('history', JSON.stringify(this.state.history));
                });
        }

        Alert.alert("", "카드를 저장했습니다. 오늘 앞으로 " + remain + "개의 카드를 추가하거나, 번호를 변경할 수 있습니다.",
            [{text: '확인', onPress: () => {navigation.goBack();}}]);
    }

    cardListDelete(index){
        Alert.alert('','카드를 삭제하시겠습니까?'
            , [
            {text: '아니오'},
            {text: '예', onPress: () => {
                    RNFS.unlink(this.state.cards[index].image);
                    this.setState({
                    cards: update(this.state.cards, {
                        $splice: [[index, 1]]
                    })
                }, async () => {
                        await AsyncStorage.setItem('cards', JSON.stringify(this.state.cards));
                    }
                );
            }}]
        );
    }

    render() {
        let cardWidget = [];

        this.state.cards.forEach((card, index) => {
            cardWidget.push(
                <Card card={card} index={index}
                      onPress={(card, index) => this.switch(card, index)} cardHeight={this.state.cardHeight}
                      disableCallback={(card, index) => this.disable(card, index)}
                      update={(name, sid, index, image, navigation) => this.cardListUpdate(name, sid, index, image, navigation)}
                      delete={(index) => this.cardListDelete(index)}
                      navigation={this.props.navigation}
                />);
        });

        return (
            <SafeAreaView style={{flex: 1, paddingTop: StatusBar.currentHeight}}>
                <StatusBar
                    barStyle='dark-content'
                    translucent={true}
                    backgroundColor={'#ffffff'}
                />
                <View style={{
                    height: 48,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                }}>
                    <View style={{flex: 1, alignItems: 'center',
                        justifyContent: 'center',}}>
                        <Text style={{
                            fontSize: 17,
                            fontWeight: 'bold',
                            textAlignVertical: 'center',
                        }}>
                            홈
                        </Text>

                        <TouchableOpacity style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onPress={() => this.props.navigation.navigate('CardEditScreen',{ update:(name, sid, index, image, navigation) => this.cardListUpdate(name, sid, index, image, navigation)})}
                        >
                            <Icon name='add' size={26} color={'rgba(0,0,0,0.7)'}/>
                        </TouchableOpacity>
                    </View>
                </View>

                {this.state.cards && this.state.cards.length > 0 ? (
                <ScrollView style={{flex: 1,}}>
                    {cardWidget}
                </ScrollView>
                ) : (
                    <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
                        <Text style={{fontSize: 17, color: '#9E9E9E', }}>{'우측 상단의 +를 눌러 카드를 추가해주세요'}</Text>
                    </View>
                )
                }

            </SafeAreaView>
        )
    }
}

export default MainScreen;
