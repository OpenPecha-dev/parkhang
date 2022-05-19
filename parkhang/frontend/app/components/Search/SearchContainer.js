// @flow
import React from "react";
import { connect } from "react-redux";
import Search from "./Search";
import type { Props } from "./TextHeading";
import * as actions from "actions";
import * as reducers from "reducers";
import type { AppState } from "reducers";
import {redirect} from 'redux-first-router'


const mapStateToProps = (state: AppState): {} => {
    const searchTerm=reducers.getSearchTerm(state);
    return {
      searchTerm:searchTerm
    };
};


const mapDisptchToProps = dispatch =>{

  return {
    changeSearchTerm:(searchTerm)=>{ 
      dispatch(actions.changedSearchTerm(searchTerm))
    }
  }
} 

const searchContainer = connect(mapStateToProps,mapDisptchToProps)(
    Search
);

export default searchContainer;
