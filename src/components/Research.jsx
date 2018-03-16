import React from 'react';
import SelectTags from './SelectTags.jsx';
import DisplayUsers from './DisplayUsers.jsx';
import Ripple from 'react-ripples';
import ReactLoading from 'react-loading';

let initial_state = {
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

export default class Research extends React.Component {
    constructor(props) {
        super(props);
        this.state = initial_state;
        this.getTags = this.getTags.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.refresh = this.refresh.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    // componentWillUpdate(nextProps, nextState)  //TODO refresh animation  maybe  on this

    // componentDidUpdate(prevProps, prevState) {
    // }

    componentWillMount() {
        if (this.props.match === 'match') {
            this.setState({
                ['dofirstmatch']: 'match',
                ['match']: 'match'
            });
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0);

        // if (this.state.dofirstmatch)
            this.refresh();
        window.addEventListener("scroll", this.handleScroll);

        this.props.socket.on('ReceiveUsers', (users, from) => {
           if (this.props.match === users.match) {
               let data = [];
               users.result.forEach(users => {
                   data.push(users);
               });

               if (this.state.dofirstmatch) {
                   users.dofirstmatch = '';  //TODO CHECK IT MOTHER GFUCKER
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
                           // result: data
                           result: [...this.state.result, ...data]
                       }, () => {
                           window.addEventListener("scroll", this.handleScroll);
                       })
                   } else {
                       this.setState({
                           result: data
                           // result: [...this.state.result, ...login]
                       }, () => {
                           window.addEventListener("scroll", this.handleScroll);
                       });
                   }
               }
           }
        });
    }

    componentWillUnmount() {
        this.props.socket.off('ReceiveUsers');
        window.removeEventListener("scroll", this.handleScroll);
    }

    componentWillReceiveProps(nextProps){
        let user = (() => {
            const {notif, match, ...nPuser} = this.props.user;
            return nPuser;
        })();
        let nextUser = (() => {
            const {notif, match, ...nPuser} = nextProps.user;
            return nPuser;
        })();

        if (JSON.stringify(user) !== JSON.stringify(nextUser) || nextProps.refreshlist) {
            if (this.state.match && this.state.match === 'match') {
                this.setState(Object.assign({}, initial_state, {
                    ['dofirstmatch']: 'match',
                    ['match']: 'match'
                }), () => {
                    this.refresh();
                });
            } else {
                this.setState({
                    ['resultLength']: 0
                }, () => {
                    this.refresh();
                });
            }
        }
    }

    handleScroll() {
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;
        if (windowBottom >= docHeight && this.props.render) {
            this.setState({['resultLength']: this.state.result.length}, () => this.refresh('scroll'));
        }
    }

    refresh(from) {
        window.removeEventListener("scroll", this.handleScroll);
        this.props.socket.emit('ResearchUsers', this.state, from);
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
                <img style={{width: '80%', height: '80%'}} src={'../../img/icon/' + this.state.display.img + '.png'}/>
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

    resForm() {
        let sort = this.sortbox();
        let gender = !this.props.match ? this.genderbox() : '';
        let attraction = !this.props.match ? this.attractionbox() : '';
        let age = this.agebox();
        let distance = this.distancebox();
        let tags = this.tagsbox();

        return (
            <div className={'formcontent'}>
                <form className={this.state.display.form}>
                    {sort}
                    {gender}
                    {attraction}
                    {age}
                    {distance}
                    {tags}
                </form>
                {this.displaybutton()}
            </div>
    )

    }

    render() {
        let restyle = {
            display: 'flex',
        };

        let  res = '';
        let resForm = '';
        if (this.props.render) {
            res = this.state.result;
            resForm = this.resForm();
        } else {
            res = this.state.result.slice(0, 4);
            resForm = '';
        }

        let clasname = 'homeContent';
        if (this.state.match === 'match')
            clasname = '';

        return (
            <div className={clasname}>
                {resForm}
                    <DisplayUsers user={this.props.user} handleClick={this.props.handleClick}
                                  result={res} allUsers={this.props.allUsers} idList={'home'}/>
            </div>
        );
    }
}

