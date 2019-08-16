import React, { Component } from 'react';
import './App.css';
import ReactMapGL from 'react-map-gl';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Delete from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';

import axios from 'axios';

const MBTOKEN = process.env.REACT_APP_MAPBOX_KEY

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table:{
    minWidth: 400,
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 440,
        height: 400,
        longitude: -97.7431,
        latitude: 30.2672,
        zoom: 11
      },
      mapStyle: {
        "version": 8,
        "name": "default",
      },
      dogs: [],
      filter: '',
      filteredDogs: [],
    };
  }
  componentDidMount() {
    // Here is a link to the API Documentation: https://dev.socrata.com/
    axios
      .get('https://data.austintexas.gov/resource/h8x4-nvyi.json')
      .then(res => {
        this.setState({ dogs: res.data, filteredDogs: res.data})
      })
      .catch(error=>console.log(error))
  }

  getDogName(dogObj){
    // the data has quote marks as well as left/right quotes
    const nameRegEx = /"(.*)"|“(.*)”/;
    const nameArray = dogObj.description_of_dog.match(nameRegEx);
    let dogName = 'no name'
    if (Array.isArray(nameArray)) {
      dogName = nameArray[1] || nameArray[2]
    }
    // some of the dog names include a comma at the end. This removes the comma
    if (dogName.slice(-1) === ','){
      return dogName.slice(0,-1)
    }
    return dogName;
  }

  filterDogs(input) {
    const searchMatch = new RegExp(input.toLowerCase().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
    // edit the keys if you want to restrict which fields to search
    const keys = ['first_name', 'last_name', 'address', 'zip_code', 'description_of_dog'];
    let results = [];

    if (input === '' || input === '\\') {
      results = this.state.dogs;
    } else if (this.state.dogs.length < 1) {
      results = [];
    } else { 
      this.state.dogs.forEach((dogObj) => {
        keys.forEach((key) => {
          // Match the regex to the current object; ensure it's not already in array
          if (searchMatch.test(dogObj[key].toString().toLowerCase())
            && results.indexOf(dogObj) < 0) {
          results.push(dogObj);
          }
        });
      });
    }

    this.setState({filteredDogs: results});
  }

  handleChange(e) {
    this.setState({
      filter: e.target.value
    });
    this.filterDogs(e.target.value);
  }

  clearFilter() {
    this.setState({
      filter: '',
      filteredDogs: this.state.dogs,
    });
  }

  
  render() {
    const { classes } = this.props;
    const mapElement = document.getElementById('map');

    return (
      <div className="App">
        <div className="App-header">
          <h2>Dangerous Dogs</h2>
        </div>

       <Grid container spacing={3}>
       <Grid item sm={7} xs={12}>
        <p>The following dogs have been declared as Dangerous Dogs in the city of Austin.</p>
        <p>Filter the list of dogs by entering your search term in the input below</p>

        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            id="outlined-name"
            label="Search Dogs"
            className={classes.textField}
            value={this.state.filter}
            onChange={e=>this.handleChange(e)}
            margin="normal"
            variant="outlined"
            InputProps={{
              endAdornment:               
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={()=>this.clearFilter()}
                >
                  <Delete />
                </IconButton>
              </InputAdornment>
            }}
          />
        </form>
        <p>
          Clicking a row will center the map at that dog's residence.
          <Hidden smUp>
            <Button
              variant="outlined"
              size="small"
              onClick={(e)=> {
                e.preventDefault();
                mapElement.scrollIntoView({
                  behavior: "smooth",
                  block: "end",
                });
              }}
            >
              Scroll to Map
            </Button>
          </Hidden>
        </p>
        <p>The data set and additional information is available at {' '}
          <a 
            href="https://data.austintexas.gov/Health-and-Community-Services/Declared-Dangerous-Dogs/ykw4-j3aj">
            Open Data Portal
          </a>
        </p>
        <Paper className={classes.root}>
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Dog Name</TableCell>
                <TableCell align="right">Owner Name</TableCell>
                <TableCell align="right">Address</TableCell>
                <TableCell align="right">Zip Code</TableCell>
                <TableCell align="right">Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.filteredDogs.map(dog => (
                <TableRow 
                  key={dog.name}
                  onClick={() => {
                    this.setState({
                      viewport: {
                        ...this.state.viewport,
                        longitude: dog.location.coordinates[0],
                        latitude: dog.location.coordinates[1],
                        zoom: 13,
                      }
                    })
                  }}
                >
                  <TableCell component="th" scope="row">
                    {this.getDogName(dog)}
                  </TableCell>
                  <TableCell align="right">
                    {`${dog.first_name} ${dog.last_name}`}
                  </TableCell>
                  <TableCell align="right">
                    {dog.address}
                  </TableCell>
                  <TableCell align="right">
                    {dog.zip_code}
                  </TableCell>
                  <TableCell align="right">
                    {dog.description_of_dog}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>

       <Grid item sm={5} xs={12} id='map'>
          <ReactMapGL
            ref={(reactMap)=> {this.reactMap = reactMap; }}
            {...this.state.viewport}
            onViewportChange={(viewport) => this.setState({viewport})}
            mapboxApiAccessToken={MBTOKEN}
            onLoad={()=>console.log('loaded ', this.state.mapStyle)}
            // mapStyle={'mapbox://styles/mapbox/streets-v8'}
            mapStyle={'mapbox://styles/chiaberry/cjzd7pze42uuy1cpd2tm827ym'}
          />
          <div style={{padding:15}}>
           <Button
              variant="outlined"
              size="small"
              onClick={()=> {
                this.setState({
                  viewport: {
                    ...this.state.viewport,
                    longitude: -97.7431,
                      latitude: 30.2672,
                    zoom: 11
                  }
                })
              }}
            >
              Reset Map
            </Button>
            <Hidden smUp>
              <Button
                variant="outlined"
                size="small"
                onClick={()=>{
                  window.scroll({top:0,left:0,behavior:'smooth'});
                }}
              >
                Back to Top
              </Button>
            </Hidden>
          </div>
      </Grid>
    </Grid>
    </div>
    );
  }
}

export default withStyles(styles)(App);
