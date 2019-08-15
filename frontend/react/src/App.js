import React, { Component } from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Delete from '@material-ui/icons/Delete';

import axios from 'axios';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    // backgroundColor: 'deeppink',
  },
});


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dogs: [],
      selectedDog: {},
      filter: '',
      filteredDogs: [],
    };
  }
  componentDidMount() {
    // Here is a link to the API Documentation: https://dev.socrata.com/
    axios.get('https://data.austintexas.gov/resource/h8x4-nvyi.json')
      .then((res) => {
        console.log(res);
        this.setState({ dogs: res.data, filteredDogs: res.data})
      })
  }

  getDogName(dogObj){
    // the data has quote marks as well as left/right quotes
    const nameRegEx = /"(.*)"|“(.*)”/;
    const nameArray = dogObj.description_of_dog.match(nameRegEx);
    if (Array.isArray(nameArray)){
      return nameArray[1] || nameArray[2]
    }
    return 'no name';
  }

  filterDogs(input) {
    const searchMatch = new RegExp(input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
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

  handleChange(e){
    console.log(e.target.value)
    this.setState({filter:e.target.value})
    this.filterDogs(e.target.value);
  }

  clearFilter(){
    this.setState({
      filter: '',
      filteredDogs: this.state.dogs,
    })
  }

  
  render() {
    const { classes } = this.props;

    return (
      <div className="App">
        <div className="App-header">
          <h2>Dangerous Dogs</h2>
        </div>

       <Grid container spacing={3}>
       <Grid item sm={6}>
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
                  // onMouseDown={handleMouseDownPassword}
                >
                  <Delete />
                </IconButton>
              </InputAdornment>
            }}
          />
        </form>
        <p>The data set and additional information is available at {' '}
          <a 
            href="https://data.austintexas.gov/Health-and-Community-Services/Declared-Dangerous-Dogs/ykw4-j3aj">
            Open Data Portal
          </a>
        </p>
       <Paper style={{padding: 24}}>
       <Table className={classes.table} size="small">
         <TableHead>
           <TableRow>
             <TableCell>Owner Name</TableCell>
             <TableCell align="right">Address</TableCell>
             <TableCell align="right">Zip Code</TableCell>
             <TableCell align="right">Dog Name</TableCell>
             <TableCell align="right">Description</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {this.state.filteredDogs.map(dog => (
            <TableRow key={dog.name}>
              <TableCell component="th" scope="row">
                {`${dog.first_name} ${dog.last_name}`}
              </TableCell>
              <TableCell align="right">{dog.address}</TableCell>
              <TableCell align="right">{dog.zip_code}</TableCell>
              <TableCell align="right">{this.getDogName(dog)}</TableCell>
              <TableCell align="right">{dog.description_of_dog}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
        
       </Grid>

       <Grid item sm={6}>

    </Grid>
    </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(App);
