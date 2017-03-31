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
        this.state = {
            showSemver: localStorage.getItem('showSemver') === 'true',
            semver: 'Minor'
        };
    }

    toggleSemver(showSemver) {
        this.setState(Object.assign({}, this.state, {showSemver}));
        localStorage.setItem('showSemver', showSemver);
    }

    setSemver(level) {
        this.setState(Object.assign({}, this.state, {semver: level}));
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
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
        const animalIndex = Math.floor(animals.length * Math.random());
        const adjectiveIndex = Math.floor(adjectives.length * Math.random());
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
            <div className='SemverToggle'>
                include semver level (<span onClick={()=> this.toggleSemver(true)} className={this.state.showSemver ? 'active' : ''}>Yes</span>/<span onClick={()=> this.toggleSemver(false)} className={!this.state.showSemver ? 'active' : ''}>No</span>)
            </div>
        </div>;
    }
}


export default Namer;