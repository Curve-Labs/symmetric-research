// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    uint256 public AMOUNT = 100 ether;

    constructor (string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, AMOUNT);
    }

    function mint() public {
        _mint(msg.sender, AMOUNT);
    }
}
