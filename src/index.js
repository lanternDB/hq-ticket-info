import React from "react"
import { createRoot } from "react-dom/client"

import useCopyClipboard from "react-use-clipboard"

import styled, { css } from "styled-components"
import "./index.css"

createRoot(document.getElementById("root")).render(<App/>)

const initialState = {
  activeID: 0,
  computerName: "",
  email: "",
  notes: "",
  phoneNumber: "",
  location: "On-Site",
  summary: "",

  history: [],
  showHistory: false,
  isViewingHistory: false,
}

const Context = React.createContext({ state: initialState, dispatch: () => null })

const actionsTable = {
  updateInput: "updateInput",
  toggleHistory: "toggleHistory",
  save: "save",
  clear: "clear",
  load: "load",
  setHistory: "setHistory",
  delete: "delete"
}

const dispatchTable = {
  updateInput: (state, action) => ({...state, [action.payload.name]: action.payload.data}),
  toggleHistory: (state, action) => ({...state, showHistory: !state.showHistory}),
  save: (state, action) => {
    if (state.activeID === 0 ) return ({...state, activeID: 0, history: [...state.history, {
      id: action.payload.id,
      computerName: state.computerName,
      email: state.email,
      notes: state.notes,
      phoneNumber: state.phoneNumber,
      location: state.location,
      summary: state.summary, 
    }]})
    else {
      return ({...state, activeID: 0, history: state.history.map((item) => {
        if (item.id === state.activeID) return ({
          id: state.activeID,
          computerName: state.computerName,
          email: state.email,
          notes: state.notes,
          phoneNumber: state.phoneNumber,
          location: state.location,
          summary: state.summary, 
        })
        return item
      })})
    }
  },
  clear: (state, action) => ({
    ...state,
    computerName: "",
    email: "",
    notes: "",
    phoneNumber: "",
    location: "On-Site",
    summary: ""
  }),
  load: (state, action) => ({
    ...state,
    activeID: action.payload.id,
    computerName: action.payload.computerName,
    email: action.payload.email,
    notes: action.payload.notes,
    phoneNumber: action.payload.phoneNumber,
    location: action.payload.location,
    summary: action.payload.summary,
  }),
  setHistory: (state, action) => ({
    ...state,
    history: [...action.payload]
  }),
  delete: (state, action) => ({...state, history: state.history.filter((item) => (item.id !== action.payload.id))
  })
}

const reducer = (state = initialState, action) => {
  return dispatchTable[action.type] ? dispatchTable[action.type](state, action) : state
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    dispatch({
      type: actionsTable.setHistory,
      payload: JSON.parse(localStorage.getItem("history"))
    })
  }, [])

  React.useEffect(() => {
    localStorage.setItem("history", JSON.stringify(state.history))
  }, [state.history])

  return (
    <Styled.App>
      <Context.Provider value={[state, dispatch]}>
        { 
          state.showHistory ? (
            <div className="panel-left"><History history={state.history} /></div>
          ) : null
        }
        <div className="panel-right">
          <div className="content-top">
            <div className="content-left">
              <div className="child">
                <Input type="text" id="email" name="email" placeholder="Email" format="lowercase" value={state.email} />
                <CopyButton onClick={() => copyUsername(state)} />
              </div>
              <div className="child">
                <Input type="text" name="summary" placeholder="Summary" value={state.summary} />
                <CopyButton onClick={() => copySummary(state)} />
              </div>
            </div>
            <div className="content-right">
              <div className="child">
                <Input type="text" name="phoneNumber" placeholder="Phone Number" value={state.phoneNumber} />
                <div className="child">
                  <RadioButton id="On-site" name="location" value="On-Site" checked={ state.location === "On-Site" } >On Site</RadioButton>
                  <RadioButton id="Remote" name="location" value="Remote" checked={ state.location === "Remote" } >Remote</RadioButton>
                </div>
              </div>
              <div className="child">
                <Input type="text" name="computerName" placeholder="Computer Name" format="uppercase" value={state.computerName} />
                <CopyButton onClick={() => copyComputerName(state)} />
              </div>
            </div>
          </div>
          <div className="content-middle">
            <TextArea name="notes" placeholder="Description of Issue/Request:" value={state.notes} />
          </div>
          <div className="content-bottom">
            <div className="left">
              <CopyButton onClick={() => copyInformation(state)}>Copy Information</CopyButton>
            </div>
            <div className="right">
              <ClearButton icon={plusIcon}>Save & Clear</ClearButton>
              <HistoryButton icon={historyIcon}>History</HistoryButton>
            </div>
          </div>
        </div>
      </Context.Provider>
    </Styled.App>
  )
}

function History() {
  const [state, dispatch] = React.useContext(Context)
  
  const handleRightClick = (e, data) => {
    e.preventDefault() 
    e.stopPropagation()
    if (e.ctrlKey) dispatch({
      type: actionsTable.delete,
      payload: { id: data.id }
    })
  }
  
  const handleClick = (data) => {
    console.log("DATA", data)
    dispatch({
      type: actionsTable.load,
      payload: {
        id: data.id,
        computerName: data.computerName,
        email: data.email,
        notes: data.notes,
        phoneNumber: data.phoneNumber,
        location: data.location,
        summary: data.summary,
      }
    })
    console.log(data)
  }
  return (
    <Styled.History>
      <p>History:</p>
      {
        state.history.map((item, index) => (
          <div style={{backgroundColor: state.activeID === item.id ? "var(--bc-secondary)" : "", color: state.activeID === item.id ? "var(--fc-secondary)" : "" }} key={index} onClick={() => handleClick(item)} onContextMenu={ (e) => (handleRightClick(e, item)) }>
            {
             item.email.split("@")[0].toLowerCase() || "undefined"
            }
          </div>
        ))
      }
  </Styled.History>
  )
}

function Input(props) {
  const [state, dispatch] = React.useContext(Context)

  const handleClick = (e) => {
    dispatch({
      type: actionsTable.updateInput,
      payload: {
        name: e.target.name,
        data: e.target.value
      }
    })
  }

  return (
    <Styled.Input tabIndex="1" type={props.type} name={props.name} placeholder={props.placeholder} value={props.value} format={props.format} onChange={(e) => handleClick(e)} />
  )
}

function TextArea(props) {
  const [state, dispatch] = React.useContext(Context)

  const handleClick = (e) => {
    dispatch({
      type: actionsTable.updateInput,
      payload: {
        name: e.target.name,
        data: e.target.value
      }
    })
  }

  return (
    <Styled.TextArea tabIndex="1" rows="18" {...props} onChange={(e) => handleClick(e)} />
  )
}

function RadioButton({ children, ...props }) {
  const [state, dispatch] = React.useContext(Context)
  
  const handleClick = (e) => {
    dispatch({
      type: actionsTable.updateInput,
      payload: {
        name: e.target.name,
        data: e.target.value
      }
    })
  }

  return (
    <Styled.RadioButton>
    <label className="radioButton">
      <span className="radioInput">
        <input type="radio" {...props} onChange={(e) => handleClick(e)} />
        <span className="radioControl"></span>
      </span>
      <span className="radioLabel">{ children }</span>
    </label>
  </Styled.RadioButton>
  )
}

function CopyButton(props) {
  const [ isCopied, setCopied ] = useCopyClipboard( props.onClick(), { successDuration: 2000 })
  return (
    <Styled.Button tabIndex="1" onClick={() => setCopied()}>{ isCopied ? copyIconSuccess : copyIconDefault }{ props.children }</Styled.Button>
  )
}
function ClearButton(props) {
  const [state, dispatch] = React.useContext(Context)

  const handleClick = () => {
    dispatch({ type: actionsTable.save, payload: { id: crypto.randomUUID() }})
    dispatch({ type: actionsTable.clear })
  }

  return (
    <Styled.Button tabIndex="1" onClick={() => {handleClick()}}>{ plusIcon }{ props.children }</Styled.Button>
  )
}
function HistoryButton(props) {
  const [state, dispatch] = React.useContext(Context)
  
  const handleClick = (e) => {
    dispatch({
      type: actionsTable.toggleHistory
    })
  }

  return (
    <Styled.Button tabIndex="1" onClick={() => handleClick()}>{ historyIcon }{ props.children }</Styled.Button>
  )
}

function Button(props) {
  return (
    <Styled.Button tabIndex="1" onClick={(e) => props.handleClick(e)} >{ props.icon }{ props.children }</Styled.Button>
  )
}

function copyUsername(data) { return data.email.split("@")[0].toLowerCase() }
function copyComputerName(data) { return data.computerName.toUpperCase() }
function copySummary(data) { return data.summary }
function copyInformation(data) { return `Username: ${data.email.split("@")[0].toLowerCase()}\nEmail: ${data.email}\nContact Number: ${data.phoneNumber}\nOn-Site/Remote: ${data.location}${data.computerName ? (`\n\nComputer Name: ${data.computerName.toUpperCase()}`) : "" }${data.notes ? (`\n\nDescription of Issue/Request:\n${data.notes}`) : ""}` }


/**
 * 1. Set up Clear and Save
 * 
 * 1. Populate history with local storage
 * 2. Save state to local storage
 * 3. Clear local storage - Disabled
 * 4. 
 */


const Styled = {
  App: styled("div")`
    position: relative;  
    
    width: 100%;  
    height: 100vh;
      
    display: flex;

    .panel-left {
      ${scrollbar}

      padding: var(--padding);
      width: 25%;
      overflow: auto;
    }

    .panel-right {
      display: flex;
      flex-direction: column;
      padding: .5rem;

      width: 100%;
      min-width: 650px;

      .content-top {
        display: flex;
        gap: .5rem;

        .content-left {
          width: 100%;

          .child {
            display: flex;
            gap: .5rem;
          }
        }

        .content-right {
          width: 100%;

          .child {
            display: flex;
            gap: .5rem;

            .child {
              display: flex;
              gap: .5rem;
              white-space: nowrap;
              
            }
          }
        }
      }

      .content-bottom {
        display: flex;
        justify-content: space-between;

        .right {
          display: flex;
          gap: .5rem;
        }
      }
    }
  `,

  History: styled("div")`
    font-family: var(--ff-secondary);

    div {
      cursor: pointer;
    
      :hover {
        background-color: var(--bc-secondary);
        color: var(--fc-secondary);
      }
    }
  `,

  Input: styled("input")`
    ${basestyles}

    display: block;
    width: 100%;
    
    text-transform: ${ (props) => props.format};
    
    ::placeholder { 
      text-transform: initial; 
    }
  `,

  TextArea: styled("textarea")`
    ${basestyles}
    ${scrollbar}
    
    display: block;
    
    width: 100%;
    height: 150px;
    
    resize: vertical;
  `,

  RadioButton: styled("div")`
    ${basestyles}

    border: none;
    
    .radioButton {
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    
    .radioInput {
      display: flex;
      input { height: 0; width: 0; opacity: 0; }
    }
    
    .radioControl {
      display: flex;
      justify-content: space-around;
      align-items: center;
    
      width: 1rem;
      height: 1rem;
    
      border-radius: 50%;
      border: .1rem solid currentColor;
    }
    
    .radioLabel {
      user-select: none;
    }
    
    input + .radioControl::before {
      content: "";
    
      width: 0.5em;
      height: 0.5em;
    
      box-shadow: inset 0.5em 0.5em white;
      border-radius: 50%;
    
      opacity: 0;
    }
    
    & input:checked + .radioControl::before {
      opacity: 1;
    }
  `,

  Button: styled("button")`
    ${basestyles}

    display: flex;
    align-items: center;
    gap: .5rem;

    appearance: none;
    user-select: none;
    text-decoration: none;
    cursor: pointer;

    :hover, 
    :focus-visible {
      background-color: hsl(0, 0%, 15%);
    }

    :active {
      background-color: var(--bc-primary);
      transform: scale(0.97);
    }
  `
}

function basestyles() {
  return css`
    margin: var(--margin);
    padding: var(--padding);

    color: var(--fc-primary);
    background-color: var(--bc-primary);

    font-size: var(--fs-primary);
    font-family: var(--ff-primary);

    border: 1px solid var(--bc-secondary);
    outline: none;
  `
}

function scrollbar() { 
  return css`
    // Firefox
    scrollbar-width: thin;
    scrollbar-color: var(--bc-secondary) transparent;

    // Chrome
    ::-webkit-scrollbar {
      width: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background-color: var(--bc-secondary);

      border: 3px solid var(--bc-primary);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-button,
    ::-webkit-scrollbar-corner {
      display: none;
    }
  `
}

const copyIconDefault = (
  <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 3)">
      <path d="m3.5 1.5c-.44119105-.00021714-1.03893772-.0044496-1.99754087-.00501204-.51283429-.00116132-.93645365.3838383-.99544161.88103343l-.00701752.11906336v10.99753785c.00061498.5520447.44795562.9996604 1 1.0006148l10 .0061982c.5128356.0008356.9357441-.3849039.993815-.882204l.006185-.1172316v-11c0-.55228475-.4477152-1-1-1-.8704853-.00042798-1.56475733.00021399-2 0"/>
      <path d="m4.5.5h4c.55228475 0 1 .44771525 1 1s-.44771525 1-1 1h-4c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1z"/>
      <path d="m2.5 5.5h5"/>
      <path d="m2.5 7.5h7"/>
      <path d="m2.5 9.5h3"/>
      <path d="m2.5 11.5h6"/>
    </g>
  </svg>
)

const copyIconSuccess = (
  <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 3)">
      <path d="m3.5 1.5c-.42139382 0-1.08806048 0-2 0-.55228475 0-1 .44771525-1 1v11c0 .5522848.44771525 1 1 1h10c.5522847 0 1-.4477152 1-1v-11c0-.55228475-.4477153-1-1-1-.8888889 0-1.55555556 0-2 0"/>
      <path d="m4.5.5h4c.55228475 0 1 .44771525 1 1s-.44771525 1-1 1h-4c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1z"/>
      <path d="m3.5 8.5 2 2 5-5"/>
    </g>
  </svg>
)

const plusIcon = (
  <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 3)">
      <path d="m3.5 1.5c-.42139382 0-1.08806048 0-2 0-.55228475 0-1 .44771525-1 1v11c0 .5522848.44771525 1 1 1h10c.5522847 0 1-.4477152 1-1v-11c0-.55228475-.4477153-1-1-1-.8888889 0-1.55555556 0-2 0"/>
      <path d="m4.5.5h4c.55228475 0 1 .44771525 1 1s-.44771525 1-1 1h-4c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1z"/>
      <path d="m6.5 5.5v6.056"/>
      <path d="m6.5 5.5v6" transform="matrix(0 1 -1 0 15 2)"/>
    </g>
  </svg>
)

const historyIcon = (
  <svg height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 2)">
      <path d="m14.5 12.5v-7l-5-5h-5c-1.1045695 0-2 .8954305-2 2v10c0 1.1045695.8954305 2 2 2h8c1.1045695 0 2-.8954305 2-2z"/>
      <path d="m8.5 4.5v4h3"/>
      <path d="m2.5 2.5c-1.1045695 0-2 .8954305-2 2v10c0 1.1045695.8954305 2 2 2h8c1.1045695 0 2-.8954305 2-2"/>
    </g>
  </svg>
)