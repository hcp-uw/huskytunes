import axios from 'axios'

// This file is a "service" that wraps calls to our API. Think of it
// as a library that provides functions to interact with our server.

const baseURL = 'http://localhost:3001/message'

// The `getMessage` function sends an HTTP GET request to the server
// to retrieve a message. It returns a promise that resolves to the
// message if the request is successful, or an error message if the
// request fails.
const getMessage = async () => {
    try {
        const response = await axios.get(`${baseURL}/hello`)
        return response.data
    } catch (error) {
        console.error(error)
        return 'Error: unable to retrieve message'
    }
}

// Instead of exporting the function as default, we can export an object
// with the function as a property. This allows us to import multiple
// functions from the same file.
export { getMessage }