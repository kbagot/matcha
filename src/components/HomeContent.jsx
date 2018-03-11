import React from 'react';
import Research from './Research.jsx';
import HomeUsers from './HomeUsers.jsx';
import Chat from './Chat.jsx';

export default class HomeContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visiteur: false,
            match: false,
            star: false,
            morebut: false,
            showres: false,
        };
        this.moreClick = this.moreClick.bind(this);
        this.showRes = this.showRes.bind(this);
    }

    componentDidMount() {
    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    moreClick (e) {
        let val = !this.state[e.target.name];
        this.setState({
            [e.target.name]: val
        }
        // , () => console.log(this.state)
        );
    }

    homecontents(name, idList) {
        let view = '';
        if (!this.state[name] && idList)
            idList = idList.slice(0, 4);
        if (name === 'match')
            view = <Research socket={this.props.socket} allUsers={this.props.allUsers} user={this.props.user}
                       match={'match'} handleClick={this.props.handleClick} render={this.state.match} idList={'home'}/>;
             else
            view = <HomeUsers socket={this.props.socket} user={this.props.user} profil={this.props.profil}
                           idList={idList} allUsers={this.props.allUsers} handleClick={this.props.handleClick}/>;

        let fu = '';
        if (name === 'match')
            fu = '_ME';
        let morebut = !this.state.morebut ? <button name={name} onClick={this.moreClick}>{name + fu}</button> : '';

        return (
            <div className={'homePart'}>
                <div className={'homeContentHeader'}>
                    {morebut}
                </div>
                    {view}
            </div>
        )
    }

    showRes () {
        this.setState({
                ['showres']: !this.state.showres
            })
    }

    content() {
        return (
            <div className={'homeContent'}>
                {this.homecontents('star', 'star')}
                {this.homecontents('visiteur', this.props.user.visits)}
                {this.homecontents('match')}
            </div>
        )

    }

    render() {
        this.props.user.visits = ['500', '400', '300', '460', '450', '404', '403', '409', '408', '410', '470', '401', '402', '405', '499'];

        let view;
        let resbut;
        if (this.state.showres) {
            view = <Research socket={this.props.socket} allUsers={this.props.allUsers} user={this.props.user}
                             match={''} handleClick={this.handleClick} render={true}/>;
            resbut = '◀' + 'ACCUEIL';
        }else {
            view = this.content();
            resbut = 'RECHERCHE        ' + '🔎';
        }


        return (
            <div className={'Content'}>
                <button className="hburgerbut" onClick={this.showRes}>{resbut}</button>
                    {view}
                <Chat allUsers={this.props.allUsers} user={this.props.user} socket={this.props.socket}
                      listUsers={this.listUsers} profil={this.props.handleClick}/>
            </div>
        )
    }
}