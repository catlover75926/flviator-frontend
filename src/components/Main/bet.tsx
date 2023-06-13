import React, { useEffect } from "react";
// import { useCrashContext } from "../context";
import { toast } from 'react-toastify';
import Context, { callCashOut } from "../../context";

interface BetProps {
	index: 'f' | 's'
}
type FieldNameType = 'betAmount' | 'decrease' | 'increase' | 'singleAmount'
type BetOptType = '20' | '50' | '100' | '1000'
type GameType = 'manual' | 'auto'

const Bet = ({ index }: BetProps) => {
	const context = React.useContext(Context)
	const { state,
		fbetted, sbetted,
		fbetState,sbetState,
		GameState,
		currentNum,
		currentSecondNum,
		update,
		updateUserBetState
	} = context;
	const [cashOut, setCashOut] = React.useState(2);

	const auto = index === 'f' ? state.userInfo.f.auto : state.userInfo.s.auto
	const betted = index === 'f' ? fbetted : sbetted
	const deState = index === 'f' ? state.fdeState : state.sdeState
	const inState = index === 'f' ? state.finState : state.sinState
	const betState = index === 'f' ? fbetState : sbetState
	const decrease = index === 'f' ? state.fdecrease : state.sdecrease
	const increase = index === 'f' ? state.fincrease : state.sincrease
	const autoCound = index === 'f' ? state.fautoCound : state.sautoCound
	const betAmount = index === 'f' ? state.userInfo.f.betAmount : state.userInfo.s.betAmount
	const autoCashoutState = index === 'f' ? state.fautoCashoutState : state.sautoCashoutState
	const single = index === 'f' ? state.fsingle : state.ssingle
	const singleAmount = index === 'f' ? state.fsingleAmount : state.ssingleAmount

	const [gameType, setGameType] = React.useState<GameType>("manual");
	const [betOpt, setBetOpt] = React.useState<BetOptType>("20");
	const [showModal, setShowModal] = React.useState(false);
	// const { index } = props;

	const minus = (type: FieldNameType) => {
		let value = state;
		if (type === "betAmount") {
			if (betAmount - 0.1 < 0.1) {
				value.userInfo[index][type] = 0.1
			} else {
				value.userInfo[index][type] = Number((Number(betAmount) - 0.1).toFixed(2))
			}
		} else {
			if (betAmount - 0.1 < 0.1) {
				value[`${index+type}`] = 0.1
			} else {
				value[`${index + type}`] = Number((Number(value[`${index + type}`]) - 0.1).toFixed(2))
			}
		}
		update(value);
	}

	const plus = (type: FieldNameType) => {
		let value = state;
		if (type === "betAmount") {
			if (value.userInfo[index][type] + 0.1 > state.userInfo.balance) {
				value.userInfo[index][type] = Math.round(state.userInfo.balance * 100) / 100
			} else {
				value.userInfo[index][type] = Number((Number(betAmount) + 0.1).toFixed(2))
			}
		} else {
			if (value[`${index + type}`] + 0.1 > state.userInfo.balance) {
				value[`${index + type}`] = Math.round(state.userInfo.balance * 100) / 100
			} else {
				value[`${index + type}`] = Number((Number(value[`${index + type}`]) + 0.1).toFixed(2))
			}
		}
		update(value);
	}

	const manualPlus = (amount: number, btnNum: BetOptType) => {
		let value = state
		if (betOpt === btnNum) {
			value.userInfo[index].betAmount = Number((betAmount + amount).toFixed(2))
		} else {
			value.userInfo[index].betAmount = Number(Number(amount).toFixed(2))
			setBetOpt(btnNum);
		}
		update(value);
	}

	const changeBetType = (e: GameType) => {
		updateUserBetState({ [`${index}betState`]: false });
		setGameType(e);
	}

	const onChangeBlur = (e: number, type: 'cashOutAt' | 'decrease' | 'increase' | 'singleAmount') => {
		let value = state;
		if (type === "cashOutAt") {
			if (e < 1.01) {
				value.userInfo[index]['target'] = 1.01;
				setCashOut(1.01);
			} else {
				value.userInfo[index]['target'] = Math.round(e * 100) / 100
				setCashOut(Math.round(e * 100) / 100);
			}
		} else {
			if (e < 0.1) {
				value[`${index + type}`] = 0.1;
			} else {
				value[`${index + type}`] = Math.round(e * 100) / 100;
			}
		}
		update(value);
	}

	const onBetClick = (s:boolean) => {
		updateUserBetState({ [`${index}betState`]: s })
	}
	const setCount = (amount: number) => {
		let attrs = state;
		attrs[`${index}autoCound`] = amount;
		update(attrs);
	}

	const reset = () => {
		update({
			[`${index}autoCound`]: 0,
			[`${index}decrease`]: 0,
			[`${index}increase`]: 0,
			[`${index}singleAmount`]: 0,
			[`${index}deState`]: false,
			[`${index}inState`]: false,
			[`${index}single`]: false,
		})
	}

	const onAutoBetClick = (_betState: boolean) => {
		let attrs = state;
		attrs.userInfo[index].auto = _betState;
		update(attrs);

		updateUserBetState({ [`${index}betState`]: _betState });

		if (!state) {
			setCount(0);
		}
	}

	const onStartBtnClick = () => {
		if (autoCound > 0) {
			if (deState || inState || single) {
				if (singleAmount > 0 || decrease > 0 || increase > 0) {
					if (deState && ((inState || deState || single || single) && inState)) {
						onAutoBetClick(true);
						setShowModal(false);
					} else {
						toast.error("Please, specify decrease or exceed stop point");
					}
				} else {
					toast.error("Can't see 0.00 as stop point");
				}
			} else {
				toast.error("Please, specify decrease or exceed stop point");
			}
		} else {
			toast.error("Please, set number of rounds");
		}
	}
	useEffect(() => {
		if (fbetted) {
			if (state.fautoCashoutState) {
				if (state.userInfo.f.target <= currentSecondNum) {
						callCashOut(state.userInfo.f.target, "f");
				}
			}
		}
		if (sbetted) {
			if (state.sautoCashoutState) {
				if (state.userInfo.s.target <= currentSecondNum) {
						callCashOut(state.userInfo.s.target, "s");
				}
			}
		}
	}, [currentSecondNum, fbetted, sbetted, state.fautoCashoutState, state.sautoCashoutState, state.userInfo.f.target, state.userInfo.s.target])
	return (
		<div className="bet-control">
			<div className="controls">
				<div className="navigation">
					<div className="navigation-switcher">
						{(betted || betState) ?
							<>
								<button className={gameType === "manual" ? "active" : ""} >Bet</button>
								<button className={gameType === "auto" ? "active" : ""} >Auto</button>
							</> :
							<>
								<button className={gameType === "manual" ? "active" : ""} onClick={() => changeBetType("manual")}>Bet</button>
								<button className={gameType === "auto" ? "active" : ""} onClick={() => changeBetType("auto")}>Auto</button>
							</>
						}
					</div>
				</div>
				<div className="first-row">
					<div className="bet-block">
						<div className="bet-spinner">
							<div className={`spinner ${betState || betted ? "disabled" : ""}`}>
								<div className="buttons">
									<button className="minus" onClick={() => betState || betted ? "" : minus("betAmount")}></button>
								</div>
								<div className="input">
									{betState || betted ?
										<input type="number" value={Number(betAmount * 10 / 10)} readOnly ></input>
										:
										<input type="number" value={Number(betAmount*10/10)} onChange={e => update({ ...state, userInfo: { ...state.userInfo, [`${index}`]: { betAmount: Number(e.target.value) }}})}></input>
									}
								</div>
								<div className="buttons">
									<button className="plus" onClick={() => betState || betted ? "" : plus("betAmount")}></button>
								</div>
							</div>
						</div>
						{betState || betted ?
							<div className="bet-opt-list">
								<button className="bet-opt disabled">
									<span>20</span>
								</button>
								<button className="bet-opt disabled">
									<span>50</span>
								</button>
								<button className="bet-opt disabled">
									<span>100</span>
								</button>
								<button className="bet-opt disabled">
									<span>1000</span>
								</button>
							</div>
							:
							<div className="bet-opt-list">
								<button onClick={() => manualPlus(20, "20")} className="bet-opt">
									<span>20</span>
								</button>
								<button onClick={() => manualPlus(50, "50")} className="bet-opt">
									<span>50</span>
								</button>
								<button onClick={() => manualPlus(100, "100")} className="bet-opt">
									<span>100</span>
								</button>
								<button onClick={() => manualPlus(1000, "1000")} className="bet-opt">
									<span>1000</span>
								</button>
							</div>
						}
					</div>
					<div className="buttons-block">
						{betted ? GameState === "PLAYING" ?
							<button className="btn-waiting" onClick={() => { callCashOut(currentNum, index) }}>
								<span>
									<label>CASHOUT</label>
									<label className="amount">
										<span>{Number(betAmount * currentNum).toFixed(2)}</span>
										<span className="currency">INR</span>
									</label>
								</span>
							</button>
							: <button className="btn-danger">WAITING</button> : betState ?
							<>
								<div className="btn-tooltip">Waiting for next round</div>
								<button className="btn-danger h-[70%]" onClick={() => {
									onBetClick(false);
									update({...state,[`${index}autoCound`]:0,userInfo:{...state.userInfo,[index]:{...state.userInfo[index],auto:false}}})
								}}><label>CANCEL</label></button>
							</> :
							<button onClick={()=>onBetClick(true)} className="btn-success">
								<span>
									<label>BET</label>
									<label className="amount">
										<span>{Number(betAmount).toFixed(2)}</span>
										<span className="currency">INR</span>
									</label>
								</span>
							</button>
						}
					</div>
				</div>
				{/* Auto */}
				{
					gameType === "auto" &&
					<>
						<div className="border-line"></div>
						<div className="second-row">
							<div className="auto-bet-wrapper">
								<div className="auto-bet">
									{auto ? (
										<button onClick={() => onAutoBetClick(false)} className="auto-play-btn btn-danger" >{autoCound}</button>
									) : (
										<button onClick={() => { setShowModal(true); }} className="auto-play-btn btn-primary">AUTO PLAY</button>
									)}
								</div>
							</div>
							<div className="cashout-block">
								<div className="cashout-switcher">
									<label className="label">Auto Cash Out</label>
									{betted || betState ? (
										<div className={`input-switch ${autoCashoutState ? "" : "off"}`}>
											<span className="oval"></span>
										</div>
									) : (
										<div onClick={() => { update({ [`${index}autoCashoutState`]: !autoCashoutState }) }} className={`input-switch ${autoCashoutState ? "" : "off"}`}>
											<span className="oval"></span>
										</div>
									)}
								</div>
								<div className="cashout-snipper-wrapper">
									<div className="cashout-snipper">
										<div className={`snipper small ${autoCashoutState && !betState ? "" : "disabled"}`}>
											<div className="input">
												{autoCashoutState && !betState ? (
													<input type="number"
														onChange={(e) => { update({ ...state, userInfo: { ...state.userInfo, [`${index}`]: { ...state.userInfo[index], target: Number(e.target.value) } } }); setCashOut(Number(e.target.value))}}
														value={cashOut}
														onBlur={(e) => onChangeBlur(Number(e.target.value) || 0, "cashOutAt")}
													/>
												) : (
													<input type="number" value={cashOut.toFixed(2)} readOnly />
												)}
											</div>
											<span className="text">x</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</>
				}
			</div >
			{showModal &&
				<div className="modal">
					<div onClick={() => setShowModal(false)} className="back"></div>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<span>Auto play options</span>
								<button className="close" onClick={() => setShowModal(false)}>
									<span>x</span>
								</button>
							</div>
							<div className="modal-body">
								<div className="content-part content-part-1">
									<span>Number of Rounds:</span>
									<div className="rounds-wrap">
										<button
											className={`btn-secondary ${autoCound === 10 ? "onClick" : ""}`}
											onClick={() => setCount(10)}>
											10</button>
										<button
											className={`btn-secondary ${autoCound === 20 ? "onClick" : ""}`}
											onClick={() => setCount(20)}>
											20</button>
										<button
											className={`btn-secondary ${autoCound === 50 ? "onClick" : ""}`}
											onClick={() => setCount(50)}>
											50</button>
										<button
											className={`btn-secondary ${autoCound === 100 ? "onClick" : ""}`}
											onClick={() => setCount(100)}>
											100</button>
									</div>
								</div>
								<div className="content-part">
									<div className={`input-switch ${deState ? "" : "off"}`}
										onClick={() => {
											update({ [`${index}deState`]: !deState, [`${index}decrease`]: 0 });
										}}
									>
										<span className="oval"></span>
									</div>
									<span className="title">Stop if cash decreases by</span>
									<div className="spinner">
										{deState ?
											<div className="m-spinner">
												<div className="buttons">
													<button onClick={() => minus("decrease")} className="minus"></button>
												</div>
												<div className="input">
													<input type="number" onChange={(e) => update({ [`${index}decrease`]: Number(e.target.value) })} value={decrease}
														onBlur={(e) => onChangeBlur(Number(e.target.value) || 0, "decrease")}
													/>
												</div>
												<div className="buttons">
													<button onClick={() => plus("decrease")} className="plus"></button>
												</div>
											</div> :
											<div className="m-spinner disabled">
												<div className="buttons">
													<button disabled className="minus"></button>
												</div>
												<div className="input">
													<input type="number" readOnly value={Number(decrease).toFixed(2)} />
												</div>
												<div className="buttons">
													<button disabled className="plus"></button>
												</div>
											</div>}
									</div>
									<span >INR</span>
								</div>
								<div className="content-part">
									<div className={`input-switch ${inState ? "" : "off"}`}
										onClick={() => {
											update({ [`${index}inState`]: !inState, [`${index}increase`]: 0 });
										}}
									>
										<span className="oval"></span>
									</div>
									<span className="title">Stop if cash increases by</span>
									<div className="spinner">
										{inState ? <div className="m-spinner">
											<div className="buttons">
												<button onClick={() => minus("increase")} className="minus"></button>
											</div>
											<div className="input">
												<input type="number" onChange={(e) => update({ [`${index}increase`]: Number(e.target.value) })} value={increase}
													onBlur={(e) => onChangeBlur(Number(e.target.value), "increase")}
												/>
											</div>
											<div className="buttons">
												<button onClick={() => plus("increase")} className="plus"></button>
											</div>
										</div> : <div className="m-spinner disabled">
											<div className="buttons">
												<button disabled className="minus"></button>
											</div>
											<div className="input">
												<input type="number" readOnly value={Number(increase).toFixed(2)} />
											</div>
											<div className="buttons">
												<button disabled className="plus"></button>
											</div>
										</div>}
									</div>
									<span >INR</span>
								</div>
								<div className="content-part">
									<div className={`input-switch ${single ? "" : "off"}`}
										onClick={() => {
											update({ [`${index}single`]: !single, [`${index}singleAmount`]: 0 });
										}}
									>
										<span className="oval"></span>
									</div>
									<span className="title">Stop if single win exceeds</span>
									<div className="spinner">
										{!!single ?
											<div className="m-spinner">
												<div className="buttons">
													<button onClick={() => minus("singleAmount")} className="minus"></button>
												</div>
												<div className="input">
													<input type="number" onChange={(e) => update({ [`${index}singleAmount`]: Number(e.target.value) })} value={singleAmount}
														onBlur={(e) => onChangeBlur(Number(e.target.value), "singleAmount")}
													/>
												</div>
												<div className="buttons">
													<button onClick={() => plus("singleAmount")} className="plus" ></button>
												</div>
											</div> :
											<div className="m-spinner disabled">
												<div className="buttons ">
													<button disabled className="minus"></button>
												</div>
												<div className="input">

													<input type="number" readOnly value={singleAmount.toFixed(2)} />
												</div>
												<div className="buttons">
													<button disabled className="plus"></button>
												</div>
											</div>
										}
									</div>
									<span >INR</span>
								</div>
							</div>
							<div className="modal-footer">
								<div className="btns-wrapper">
									<button className="reset-btn btn-waiting" onClick={reset}>Reset</button>
									<button className="start-btn btn-success" onClick={onStartBtnClick}>Start</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		</div >
	)
}

export default Bet