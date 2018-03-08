import React from 'react';
import SelectTags from './SelectTags.jsx';
import Ripple from 'react-ripples';
import ReactLoading from 'react-loading';

export default class Research extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            M: '',
            F: '',
            T: '',
            m: '',
            f: '',
            bi: '',
            trans: '',
            min: '',
            max: '',
            distance: '',
            tags: [],
            order: {
                tags: '',
                distance: '',
                age: '',
                spop: ''
            },
            result: [],
            resultLength: 0,
            dofirstmatch: '',
            matchtag: '',
            match: '',
            display: {
                form: 'resForm',
                img: 'cross'
            }
        };
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    // componentWillUpdate(nextProps, nextState)  //TODO refresh animation  maybe  on this

    // componentDidUpdate(prevProps, prevState) {
    // }

    componentWillMount() {
        if (this.props.match)
            this.setState({
                ['dofirstmatch']: 'match',
                ['match']: 'match'
            });
    }

    componentDidMount() {
        if (this.state.dofirstmatch)
            this.refresh();
        window.addEventListener("scroll", this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight) {
            this.setState({['resultLength']: this.state.result.length}, () => this.refresh('scroll'));
        }
    }

    refresh(from) {
        window.removeEventListener("scroll", this.handleScroll);
        this.props.socket.emit('ResearchUsers', this.state, (users) => {
            let data = [];
            users.result.forEach(users => {
                data.push(users);
            });
            if (this.state.dofirstmatch) {
                users.dofirstmatch = '';
                users.result = data;
                users.matchtag = users.tags;
                this.setState(users, () => {
                    window.addEventListener("scroll", this.handleScroll);
                });
            }
            else {
                if (this.state.resultLength > 0 && from === 'scroll') {
                    this.setState({
                        // result: [login]
                        result: [...this.state.result, ...data]
                    }, () => {
                        window.addEventListener("scroll", this.handleScroll);
                    })
                } else {
                    this.setState({
                        result: data
                        // result: [...this.state.result, ...login]
                    }, () => {
                        console.log(this.state);
                        window.addEventListener("scroll", this.handleScroll);
                    });
                }
            }

        });
    }

    getTags(tags) {
        let ptags = tags.map(val => val.value);
        if (!this.props.match)
            this.setState({['tags']: ptags}, () => {
                this.refresh()
            });
        else
            this.setState({['tags']: [...ptags, ...this.state.matchtag]}, () => {
                this.refresh()
            });
    }

    handleChange(ev) {
        let t = ev.target;

        if (ev.target.type === 'checkbox') {
            this.state[ev.target.name] === '' ? this.setState({[ev.target.name]: ev.target.name}, () => this.refresh()) : this.setState({[ev.target.name]: ''}, () => this.refresh());
        } else if (ev.target.name.split(' ')[0] !== 'sort') {
            this.setState({
                [ev.target.name]: ev.target.value,
            }, () => this.refresh());
        }
        else {
            let val = this.state.order[ev.target.name.split(' ')[1]];
            let order = Object.assign({}, this.state.order);  // TODO {...this.state.order} why didnotW?
            let modif = ev.target.name.split(' ')[1];

            for (let i in order) {
                if (i === modif)
                    order[i] = val === '' ? 'ASC' : val === 'ASC' ? 'DESC' : 'ASC';
                else
                    order[i] = '';
            }
            order.resultLength = 0;
            this.setState({
                    order,
                    ['resultLength']: 0
                },
                () => this.refresh()
            );
        }
    }

    displaybutton() {
        let dform = () => {
            let val = this.state.display.form;
            let img = this.state.display.img;

            if (img.split('/').pop() === 'cross')
                img = 'options';
            else
                img = 'cross';
            if (val === 'resForm')
                val = 'hidden';
            else
                val = 'resForm';
            this.setState({
                ['display']: {
                    ['form']: val,
                    ['img']: img
                }
            });
        };

        return (
            <div className="displaybutton" onClick={dform}>
                <img style={{width: '100%', height: '100%'}} src={'../../img/icon/' + this.state.display.img + '.png'}/>
            </div>
        )
    }

    sortbox() {
        return (
            <div className="resContent">
                <h3>── Trie ───────────────</h3>
                <div className={'sortbutton'}>
                    <input type="button" name="sort age" value={"Age"}
                           onClick={this.handleChange}/>
                    <div className={this.state.order.age}></div>
                </div>
                <div className={'sortbutton'}>
                    <input type="button" name="sort distance" value={"Distance"}
                           onClick={this.handleChange}/>
                    <div className={this.state.order.distance}></div>
                </div>
                <div className={'sortbutton'}>
                    <input type="button" name="sort tags" value={"Tags"}
                           onClick={this.handleChange}/>
                    <div className={this.state.order.tags}></div>
                </div>
                <div className={'sortbutton'}>
                    <input type="button" name="sort spop" value={"Popularite"}
                           onClick={this.handleChange}/>
                    <div className={this.state.order.spop}></div>
                </div>
            </div>
        )
    }

    genderbox() {
        return (
            <div className="resContent">
                <h3>── GENRES ─────────────</h3>
                <input type="checkbox" name="M" onChange={this.handleChange}/><p>Homme</p>
                <br/>
                <input type="checkbox" name="F" onChange={this.handleChange}/>Femme
                <br/>
                <input type="checkbox" name="T" onChange={this.handleChange}/>Trans
            </div>
        )
    }

    attractionbox() {
        return (
            <div className="resContent">
                <h3>── ATTIRANCES ─────────</h3>
                <input type="checkbox" name="m" onChange={this.handleChange}/>Homme
                <br/>
                <input type="checkbox" name="f" onChange={this.handleChange}/>Femme
                <br/>
                <input type="checkbox" name="bi" onChange={this.handleChange}/>Bi
                <br/>
                <input type="checkbox" name="trans" onChange={this.handleChange}/>Trans
            </div>
        )
    }

    agebox() {
        return (
            <div className="resContent">
                <h3>── AGE ────────────────</h3>
                <input placeholder="Min" type="number" name="min" min="18" max="99"
                       onChange={this.handleChange}/>
                <input placeholder="Max" type="number" name="max" min="18" max="99"
                       onChange={this.handleChange}/>
            </div>
        )
    }

    distancebox() {
        return (
            <div className="resContent">
                <h3>── DISTANCE ───────────</h3>
                <input placeholder="Km" type="number" name="distance" min="0" max="20000"
                       onChange={this.handleChange}/>
            </div>
        )
    }

    tagsbox() {
        return (
            <div className="resContent">
                <h3>── TAGS ───────────────</h3>
                <SelectTags socket={this.props.socket} sendTags={this.getTags}/>
            </div>
        )
    }

    render() {
        let sort = this.sortbox();
        let gender = !this.props.match ? this.genderbox() : '';
        let attraction = !this.props.match ? this.attractionbox() : '';
        let age = this.agebox();
        let distance = this.distancebox();
        let tags = this.tagsbox();

        let restyle = {
            display: 'flex',
        };

        return (
            <div style={restyle}>
                {this.displaybutton()}
                <form className={this.state.display.form}>
                    {sort}
                    {gender}
                    {attraction}
                    {age}
                    {distance}
                    {tags}
                </form>
                <div className="resList">
                    {this.state.result.map((node, key) => {
                        let img = node.img;
                        let like = '';
                        let online = '';
                        let usersexe = 'resUserInfo';

                        if (!img && node.sexe === 'F')
                            img = '../../img/nopicF.jpg';
                        else if (!img && node.sexe === 'M')
                            img = '../../img/nopicM.jpg';
                        else if (!img && node.sexe === 'T')
                            img = '../../img/nopicT.jpg';

                        if (this.props.allUsers.findIndex(elem => elem.id === node.id) !== -1)
                             online = {color: 'lawngreen'};
                        else
                            online = {color: 'white'};
                        // const self = this.props.user.id === node.id;

                        if (this.props.profil && this.props.user)
                        if (this.props.user.match && this.props.user.match.findIndex(elem => Number(elem.id) === this.props.profil.id) !== -1) {
                            like = "../../img/fullheart.png";
                        } else if (node.user1) {
                            like = "../../img/halfheart.png";
                        } else {
                            like = "";
                        }
                        if (node.sexe === 'M')
                            usersexe += ' resUsermen';
                        else if (node.sexe === 'F')
                            usersexe += ' resUsergirl';

                        return (<div key={key} className="resUser" onClick={(ev) => this.props.handleClick(ev, node)}>
                                <img src={img} width={'100%'} height={'100%'}/>
                                <div className={usersexe}>
                                     <img className='like' src={like}/>
                                    <p style={online}>{node.login}</p>
                                </div>
                            </div>
                        )
                    })}
                    {/*<div>*/}
                    {/*<ReactLoading type='bubbles' color='#0a466b' width='30%' height='30px'/>*/}
                    {/*</div>*/}
                </div>
            </div>
        );
    }
}

