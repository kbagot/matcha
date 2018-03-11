import React from 'react';
import Research from './Research.jsx';
import HomeUsers from './HomeUsers.jsx';

export default class HomeContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visit: false,
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
                       match={'match'} handleClick={this.props.handleClick} render={this.state.match}/>;
             else
            view = <HomeUsers socket={this.props.socket} user={this.props.user} profil={this.props.profil}
                           idList={idList} allUsers={this.props.allUsers} handleClick={this.props.handleClick}/>;

        let morebut = !this.state.morebut ? <button name={name} onClick={this.moreClick}>MORE</button> : '';

        return (
            <div>
                {view}
                {morebut}
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
            <div>
                VISITEUR
                {
                    this.homecontents('visit', this.props.user.visits)
                }
                MATCH
                {
                    this.homecontents('match')
                }
                STAR
                {
                    this.homecontents('star', 'star')
                }
            </div>
        )

    }

    render() {
        this.props.user.visits = ['500', '400', '300', '460', '450', '404', '403', '409', '408', '410', '470', '401', '402', '405', '499'];

        let view;
        if (this.state.showres)
            view = <Research socket={this.props.socket} allUsers={this.props.allUsers} user={this.props.user}
                             match={''} handleClick={this.handleClick} render={true}/>;
        else
            view = this.content();

        return (
            <div className={'Content'}>
                <button onClick={this.showRes}>RESEARCH</button>
                    {view}
            </div>
        )
    }
}