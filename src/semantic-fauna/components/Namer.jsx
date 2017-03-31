import React from 'react';
import animals from 'semantic-fauna/data/animals';
import adjectives from 'semantic-fauna/data/adjectives';
import CopyIcon from 'semantic-fauna/components/CopyIcon';
import RegenerateIcon from 'semantic-fauna/components/RegenerateIcon';
import Clipboard from 'clipboard';

const clipboards = {
    main: null,
    branch: null
};


class Namer extends React.Component {
    constructor(props) {
        super(props);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.newName = this.newName.bind(this);
        this.state = {
            showSemver: localStorage.getItem('showSemver') === 'true',
            maxLength: parseInt(localStorage.getItem('maxLength')) || false,
            semver: 'Minor',
            alliterate: localStorage.getItem('alliterate') === 'true',
            iterations: 0
        };
    }

    toggleSemver(showSemver) {
        this.setState(Object.assign({}, this.state, {showSemver}));
        localStorage.setItem('showSemver', showSemver);
    }

    toggleAlliterate(alliterate) {
        this.setState(Object.assign({}, this.state, {alliterate}));
        localStorage.setItem('alliterate', alliterate);
    }

    setMaxLength(length) {
        this.setState(Object.assign({}, this.state, {maxLength: length}));
        localStorage.setItem('maxLength', length);
    }

    setSemver(level) {
        this.setState(Object.assign({}, this.state, {semver: level}));
    }

    handleKeyDown(e) {
        if(e.keyCode === 32) {
            e.preventDefault();
            this.newName();
        }
    }

    handleHashChange() {
        const hash = decodeURIComponent(window.location.hash.substring(1));
        if(hash.indexOf('|') === -1) return;
        const parts = hash.split('|');

        const adjectiveIndex = parseInt(window.atob(parts[0]), 10);
        const animalIndex = parseInt(window.atob(parts[1]), 10);

        this.setState(Object.assign({}, this.state, {
            adjective: adjectives[adjectiveIndex],
            animal: animals[animalIndex]
        }));
    }


    newName() {
        let adjectiveIndex = Math.floor(adjectives.length * Math.random());
        let animalIndex = Math.floor(animals.length * Math.random());
        var i = 1;

        while(
            (this.state.alliterate && animals[animalIndex][0] !== adjectives[adjectiveIndex][0]) ||
            (this.state.maxLength && (animals[animalIndex] + adjectives[adjectiveIndex]).length > this.state.maxLength)
        ) {
            adjectiveIndex = Math.floor(adjectives.length * Math.random());
            animalIndex = Math.floor(animals.length * Math.random());
            i++;
        }

        this.setState({iterations: i});

        window.location.hash = window.btoa(adjectiveIndex.toString()) + '|' +
                               window.btoa(animalIndex.toString());
    }


    bindCopyMain(elem) {
        if(!elem) return clipboards.main.destroy();
        clipboards.main = new Clipboard(elem, {
            text: (trigger) => {
                return this.getReleaseMain();
            }
        });
    }

    bindCopyBranch(elem) {
        if(!elem) return clipboards.branch.destroy();
        clipboards.branch = new Clipboard(elem, {
            text: (trigger) => {
                return this.getReleaseBranch();
            }
        });
    }

    componentDidMount() {
        window.addEventListener('hashchange', this.handleHashChange);
        window.document.addEventListener('keydown', this.handleKeyDown);
        if(!window.location.hash || window.location.hash === '#') {
            this.newName();
        } else {
            this.handleHashChange();
        }
    }

    getReleaseMain() {
        return (this.state.adjective + '-' + this.state.animal).replace(/(\b|-)(\w)/g, function(match, boundary, letter){
            return letter.toUpperCase();
        }) + (this.state.showSemver ? ' ('+this.state.semver+')' : '');
    }

    getReleaseBranch() {
        return 'release/' + this.state.adjective + '-' + this.state.animal + (this.state.showSemver ? '-'+this.state.semver.toLowerCase() : '');;
    }

    render(): React.Element<any> {
        if(!this.state.animal || !this.state.adjective) return <div></div>

        const release = this.getReleaseBranch();
        const startledCamelCaseRelease = this.getReleaseMain();

        return <div className='Wrapper'>
            <div className='Container'>
                <div className='Release Release-main'>
                    {startledCamelCaseRelease}
                    <div className='Release_copy' id='release-main-copy' ref={this.bindCopyMain.bind(this)}>
                        <CopyIcon/>
                    </div>
                </div>
                <br/>
                <div className='Release Release-branch'>
                    {release}
                    <div className='Release_copy' id='release-branch-copy' ref={this.bindCopyBranch.bind(this)}>
                        <CopyIcon/>
                    </div>
                </div>
                <br/>
                {
                    this.state.showSemver ? (
                        <div className='ChooseSemver'>
                            <span onClick={() => this.setSemver('Major')} className={this.state.semver === 'Major' ? 'active' : ''}>
                                major
                            </span>
                            <span onClick={() => this.setSemver('Minor')} className={this.state.semver === 'Minor' ? 'active' : ''}>
                                minor
                            </span>
                            <span onClick={() => this.setSemver('Patch')} className={this.state.semver === 'Patch' ? 'active' : ''}>
                                patch
                            </span>
                        </div>
                    ) : null
                }
                <div className='Regenerate' onClick={this.newName}>
                    <RegenerateIcon/>
                </div>
            </div>
            <div className='Iterations'>
                {this.state.iterations}
            </div>
            <div className='Options'>
                <div className='Options_option'>
                    include semver level (<span onClick={()=> this.toggleSemver(true)} className={this.state.showSemver ? 'active' : ''}>Yes</span>/<span onClick={()=> this.toggleSemver(false)} className={!this.state.showSemver ? 'active' : ''}>No</span>)
                </div>
                <div className='Options_option'>
                    alliterate? (<span onClick={()=> this.toggleAlliterate(true)} className={this.state.alliterate ? 'active' : ''}>Yes</span>/<span onClick={()=> this.toggleAlliterate(false)} className={!this.state.alliterate ? 'active' : ''}>No</span>)
                </div>

                <div className='Options_option'>
                    max length:
                        <span onClick={()=> this.setMaxLength(6)} className={this.state.maxLength === 6 ? 'active' : ''}>6</span>
                        <span onClick={()=> this.setMaxLength(7)} className={this.state.maxLength === 7 ? 'active' : ''}>7</span>
                        <span onClick={()=> this.setMaxLength(8)} className={this.state.maxLength === 8 ? 'active' : ''}>8</span>
                        <span onClick={()=> this.setMaxLength(9)} className={this.state.maxLength === 9 ? 'active' : ''}>9</span>
                        <span onClick={()=> this.setMaxLength(10)} className={this.state.maxLength === 10 ? 'active' : ''}>10</span>
                        <span onClick={()=> this.setMaxLength(11)} className={this.state.maxLength === 11 ? 'active' : ''}>11</span>
                        <span onClick={()=> this.setMaxLength(12)} className={this.state.maxLength === 12 ? 'active' : ''}>12</span>
                        <span onClick={()=> this.setMaxLength(13)} className={this.state.maxLength === 13 ? 'active' : ''}>13</span>
                        <span onClick={()=> this.setMaxLength(14)} className={this.state.maxLength === 14 ? 'active' : ''}>14</span>
                        <span onClick={()=> this.setMaxLength(15)} className={this.state.maxLength === 15 ? 'active' : ''}>15</span>
                        <span onClick={()=> this.setMaxLength(false)} className={this.state.maxLength === false ? 'active' : ''}>none</span>
                </div>
            </div>
        </div>;
    }
}


export default Namer;