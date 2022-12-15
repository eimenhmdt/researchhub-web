import { useEffect, useState } from "react";
import { StyleSheet, css } from "aphrodite";
import { contractABI, stagingContractABI } from "./contractAbi";
import { ethers } from "ethers";
import {
  useContractWrite,
  usePrepareContractWrite,
  useProvider,
  useSigner,
  useSwitchNetwork,
  useNetwork,
  // eslint-disable-next-line
} from "wagmi";
import { goerli, mainnet } from "wagmi/chains";

// Component
import Button from "~/components/Form/Button";
import ETHAddressInput from "./ETHAddressInput";
import { AmountInput } from "../Form/RSCForm";
import Loader from "../Loader/Loader";

import API from "~/config/api";
import { Helpers } from "@quantfive/js-web-config";
import { INFURA_ENDPOINT } from "~/config/constants";
import { captureEvent } from "~/config/utils/events";

const isProduction = process.env.REACT_APP_ENV === "production";

const CHAIN_ID = isProduction ? mainnet.id : goerli.id;

// Constants
const RSCContractAddress = isProduction
  ? "0xd101dcc414f310268c37eeb4cd376ccfa507f571"
  : "0x7D7b31439eFe004eDC1c5632222f818369aADdEE";

const HOTWALLET = isProduction
  ? "0x76835CA5Ebc7935CedBB1e0AA3d322e704b1b7B1"
  : "0xc49b1eC975b687259750D9da7BfCC82eEaA2eF19";

const CONTRACT_ABI = isProduction ? contractABI : stagingContractABI;
export function DepositScreen(props) {
  const {
    ethAccount,
    buttonEnabled,
    connectMetaMask,
    ethAddressOnChange,
    setMessage,
    showMessage,
    openWeb3ReactModal,
  } = props;

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [amount, setAmount] = useState(0);

  const {
    data: signer,
    isError,
    isLoading,
    getSigner,
  } = useSigner({ chainId: CHAIN_ID });

  const provider = useProvider();
  const { config } = usePrepareContractWrite({
    address: RSCContractAddress,
    abi: CONTRACT_ABI,
    functionName: "transfer",
    args: [HOTWALLET, amount ? ethers.utils.parseEther(amount)._hex : 0],
  });

  const {
    data,
    isLoading: isContractLoading,
    isSuccess,
    status,
    write,
  } = useContractWrite(config);

  const [balance, setBalance] = useState(0);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [RSCContract, setRSCContract] = useState(null);

  useEffect(() => {
    const createContract = () => {
      const address = RSCContractAddress;
      const provider = new ethers.providers.JsonRpcProvider(INFURA_ENDPOINT);
      const contract = new ethers.Contract(address, CONTRACT_ABI, provider);
      setRSCContract(contract);
    };
    createContract();
  }, []);

  useEffect(() => {
    checkRSCBalance();
  }, [RSCContract, ethAccount]);

  const onChange = (e) => {
    setAmount(e.target.value);
  };

  const onClick = () => {
    checkRSCBalance();
  };

  useEffect(() => {
    if (data?.hash) {
      const PAYLOAD = {
        amount,
        transaction_hash: data.hash,
        from_address: ethAccount,
      };

      fetch(API.TRANSFER, API.POST_CONFIG(PAYLOAD))
        .then(Helpers.checkStatus)
        .then(Helpers.parseJSON)
        .then((res) => {
          props.onSuccess && props.onSuccess(data.hash);
        })
        .catch((error) => {
          captureEvent({
            error,
            msg: "Deposit backend error",
            data: {
              ...PAYLOAD,
            },
          });
          props.onSuccess && props.onSuccess(data.hash);
        });
    }
  }, [data]);

  const checkRSCBalance = async () => {
    setFetchingBalance(true);
    if (RSCContract) {
      const bigNumberBalance = await RSCContract.balanceOf(props.ethAccount);
      const balance = ethers.utils.formatUnits(bigNumberBalance, 18);
      setBalance(balance);
    }
    setFetchingBalance(false);
  };

  const signTransaction = async (e) => {
    e && e.preventDefault();

    if (!signer) {
      openWeb3ReactModal();
      return;
    }

    if (chain.id !== CHAIN_ID) {
      switchNetwork(CHAIN_ID);
    }

    write?.(); //await contract.transfer(HOTWALLET, convertedAmount);
  };

  return (
    <form className={css(styles.form)} onSubmit={signTransaction}>
      <ETHAddressInput
        label="From"
        tooltip="The address of your ETH Account (ex. 0x0000...)"
        value={ethAccount}
        onChange={ethAddressOnChange}
        containerStyles={styles.ethAddressStyles}
        placeholder={"         Connect your Wallet"}
        icon={
          <img
            src={"/static/eth-diamond-black.png"}
            className={css(styles.metaMaskIcon)}
          />
        }
        onClick={() => {
          openWeb3ReactModal();
        }}
        {...props}
      />
      <AmountInput
        minValue={0}
        maxValue={balance}
        balance={
          fetchingBalance ? <Loader loading={true} size={10} /> : balance
        }
        value={amount}
        onChange={onChange}
        containerStyles={styles.amountInputStyles}
        inputContainerStyles={styles.fullWidth}
        inputStyles={[styles.fullWidth]}
        rightAlignBalance={true}
        required={true}
      />
      <div className={css(styles.buttonContainer)}>
        <Button
          disabled={!buttonEnabled || !ethAccount}
          label={!RSCContract ? <Loader loading={true} size={10} /> : "Confirm"}
          type="submit"
          customButtonStyle={styles.button}
          rippleClass={styles.button}
        />
      </div>
    </form>
  );
}
const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  ethAddressStyles: {
    marginTop: 20,
  },
  amountInputStyles: {
    width: "100%",
    paddingBottom: 20,
  },
  fullWidth: {
    width: "100%",
    fontSize: 16,
    fontWeight: 400,
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
  },
  button: {
    width: "100%",
    "@media only screen and (max-width: 415px)": {
      width: "100%",
      height: 50,
    },
  },
  metaMaskIcon: {
    height: 23,
  },
});

export default DepositScreen;
