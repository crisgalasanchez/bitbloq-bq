import React, { Component } from 'react';
import Header from './Header';
import User from './User';
import ActionsBar from './ActionsBar';
import ProjectCard from './ProjectCard';
import PaginationBar from './PaginationBar';

class App extends Component {
	constructor(props){
		super(props);
		this.requestServer = this.requestServer.bind(this);
		this.handleInput = this.handleInput.bind(this);
		this.getRandom = this.getRandom.bind(this);
		this.state = {
			projectsForSpecificUser: [],
			projects: [],
			randomNumber:0,
			userIdArray: ['5a8e8d1809d5f4001b7fdea7','5a8dc42409d5f4001b7fdea6','581194d501c9810017bc8f48',],
			userId:''
		};
	}

	componentWillMount(){
		let random = this.getRandom(this.state.userIdArray.length);
		this.setState({
			randomNumber:random,
			userId:this.state.userIdArray[random]
		});
	}


	componentDidMount() {
		let baseApiUrl = `https://api-beta-bitbloq.bq.com/bitbloq/v1/project?`;
		let objectUserInputs = {
			creator: {
				_id: this.state.userIdArray[this.state.randomNumber]
			}
		}

		let successFn = (json) => {
			this.setState({
				projectsForSpecificUser: json
			});
		}

		this.requestServer('http://api-next.bitbloq.k8s.bq.com/bitbloq/v1/project?',
			objectUserInputs, successFn);
	}

	getRandom(number){
		return Math.floor(Math.random()*number);
	}

	requestServer(baseApiUrl, objectUserInputs, callbackFn) {
		let creatorData = JSON.stringify(objectUserInputs);
		let apiEndpoint = baseApiUrl + '&query=' + creatorData;

		fetch(apiEndpoint)
		.then(response => response.json())
		.then(json => {
			callbackFn(json);
			console.log(json);
		})
		.catch(function(error){
		})
	}

	//Get data from input
	handleInput(event){
		const searchValue = event.target.value;

		let filterQuery = {
		   "$or":[
		      {
		         "name":{
		            "$regex":searchValue,
		            "$options":"i"
		         }
		      },

		      {
		         "creator":{
		            "$regex":searchValue,
		            "$options":"i"
		         }
		      }
		   ]
		}

		let successFn = (json) => {
			this.setState({
				filter: searchValue,
				projectsForSpecificUser: json
			});
		}

		this.requestServer('http://api-next.bitbloq.k8s.bq.com/bitbloq/v1/project?',
			filterQuery, successFn);
	}

//'http://api-next.bitbloq.k8s.bq.com/bitbloq/v1/project?page=0&query={"$or":[{"name":{"$regex":"coche","$options":"i"}},{"creator":{"$regex":"coche","$options":"i"}}]}
//'

	render() {
		return (
			<div className="page">
				<div className="nav">
					<Header />
					<User projects={this.state.projectsForSpecificUser} userId={this.state.userId} />
				</div>
				<div className="main">
					<ActionsBar handleInput={this.handleInput}/>
					<div className="projects--general-container">
						{this.state.projectsForSpecificUser.map(x =>(
							<ProjectCard idProject={x._id} name={x.name} username={x.creator.username}  timesAdded={x.timesAdded} timesViewed={x.timesViewed} />
						))}
					</div>
					<PaginationBar projects={this.state.projectsForSpecificUser} userId={this.state.userId}/>
				</div>
			</div>
		);
	}
}

export default App;
