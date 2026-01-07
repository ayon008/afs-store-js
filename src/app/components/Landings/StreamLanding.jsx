import React from 'react'

const StreamLanding = ({ setIsLanding }) => {
    return (
        <div>
            <button className='cursor-pointer bg-red-300 p-3' onClick={() => setIsLanding(false)}>Close</button>
            <h1>Stream Landing</h1>
        </div>
    )
}

export default StreamLanding;