import React from 'react'
import styles from './Search.css'
function Search(props) {

const {searchTerm} =props

  return (
    <div className={styles.SearchContainer}>
      <div className={styles.SearchTitle}>Search for: {searchTerm}</div>
    </div>
  )
}

export default Search