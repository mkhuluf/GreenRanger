import React from 'react';
import { StyleSheet, Text, TextInput, WebView, Linking, ListView, View, Image, TouchableHighlight, Alert, SafeAreaView} from 'react-native';
import {SearchBar, Header, Button, Icon} from 'react-native-elements';
import Glasses from "../components/Glasses";
//import {createStackNavigator} from 'react-navigator';
import {Actions} from 'react-native-router-flux';
import Swiper from 'react-native-swiper';
import Drawer from 'react-native-drawer';
import SideMenu from 'react-native-side-menu';
import Menu from './Menu';
import Logo from "../components/Logo";
const menuLogo = require("../images/menu_logo.png");

// In future, set this equal to the default sport set on
// the user's account. -JG
export var REQUEST_XML_URL = 'http://www.espn.com/espn/rss/ncb/news';
//const REQUEST_XML_URL = 'https://www.cbsnews.com/rss/';

export default class HomePage extends React.Component {

    // Uncommenting this will crash the app because sportsSelection doesn't exist yet
    goSelection() {
        Actions.sportselection();
    }
    goAccount(){
        Actions.account();
    }
    goProfile(){
        Actions.profile();
    }

    static refreshPage(){
        this.reload()
    }

    closeControlPanel = () => {
        this.drawer.close()
    };
    openControlPanel = () => {
        this.drawer.open()
    };

    // Constructor, involving the state of the RSSFeed
    // Checks for XML source, loading status
    constructor(props){
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2, }),
            loaded: false,
            text: REQUEST_XML_URL,
            title: "",

            isOpen: false,
            selectedItem: 'About',
        };
        this.handlePress = this.handlePress.bind(this);
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
    updateMenuState(isOpen) {
        this.setState({ isOpen });
    }

    onMenuItemSelected = item =>
        this.setState({
            isOpen: false,
            selectedItem: item,
        });

    render() {
        const menu = <Menu onItemSelected={this.onMenuItemSelected} />;

        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return (
            // The view with the placeholder text needs to be it's own navigation bar
            // so that we can actually move between screens without using routes (deprecated?).
            // Ideally it's just navigation buttons that take you from one screen to another.
            // Idk if the onPress is working because the settings page doesn't have anything
            // yet so that needs to be tested.
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={isOpen => this.updateMenuState(isOpen)}
                menuPosition={'right'}
            >
            <View>
                <SafeAreaView style={styles.safeArea}>
                </SafeAreaView>
                <Header
                    resizeMode="cover"
                    leftComponent={{ icon: 'account-circle', color: '#fff', size: 35, onPress: () => this.goAccount(), underlayColor:'#ff3b3b'}}
                    centerComponent={
                        <Image
                            source={require("../images/GlassesWhiteVector.png")}
                            style={styles.topLogo}
                        />
                    }
                    rightComponent={{ icon: 'menu', color: '#fff', size: 35, onPress: () => this.toggle(), underlayColor:'#ff3b3b'}}
                    backgroundColor={'#ff3b3b'}
                />
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderFeed}
                    style={styles.ListView}
                />
            </View>
            </SideMenu>
        );
    }

    componentDidMount() {
        this.fetchData(REQUEST_XML_URL);
    }

    reloadURL(NEW_URL) {
        REQUEST_XML_URL = NEW_URL;
        this.fetchData(REQUEST_XML_URL);
    }

    fetchData(URL) {
        const targetURL = 'https://api.rss2json.com/v1/api.json?rss_url=';

        fetch(targetURL + URL)
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData);

                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(responseData.items),
                    loaded: true,
                    title: responseData.feed.title,
                });
            })
            .done();
    }

    renderLoadingView() {
        return (
            <View style={styles.container}>
                <Text>
                    Loading Feed...
                </Text>
            </View>
        );
    }

    handlePress() {
        const { title, entries } = this.state;
        this.props.navigator.push('feed', { title, entries });
    }

    renderFeed(item) {
        return (
            <TouchableHighlight
                onPress={() => {
                //Alert.alert(item.title, item.description)
                return (
                    // Test Code
                    //Alert.alert("changed to " + REQUEST_XML_URL)
                    <WebView
                        ref={(ref) => { this.webview = ref; }}
                        source={{ item }}
                        onNavigationStateChange={(event) => {
                            if (event.url !== uri) {
                                this.webview.stopLoading();
                                Linking.openURL(event.url);
                            }
                        }}
                    />
                );
            }}>
                <View style={styles.container}>
                    <Image
                        source={{uri: item.enclosure.link}}
                        style={styles.thumbnail}
                    />
                    <View style={styles.rightContainer}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topLogo: {
        width: 140,
        height: 35,
        marginTop: 25
    },
    safeArea: {
        marginTop: -25,
        backgroundColor: '#ff3b3b'
    },
    thumbnail: {
        width: 100,
        height: 70,
    },
    rightContainer: {
        paddingLeft: 5,
        paddingRight:5,
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
        textAlign: 'left',
    },
    description: {
        fontSize: 12,
        textAlign: 'left',
    },
    listView: {
        paddingTop: 20,
        backgroundColor: '#F5FCFF',
    },
    header: {
        width: '100%',
        backgroundColor: '#FF3b3b',
        borderBottomColor:'transparent',
        borderTopColor:'transparent'
    },
    button: {
        position: 'absolute',
        top: 20,
        padding: 10,
    },
    caption: {
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: 'center',
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});