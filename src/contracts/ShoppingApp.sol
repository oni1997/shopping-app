// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
contract ShoppingApp {
    struct Item {
        address owner;
        string name;
        string imageURL;
        string description;
        string location;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    mapping(address => uint256[]) public boughtItems;
    mapping(address => uint256[]) public soldItems;

    IERC20 public fzarToken;
    IERC20 public cusdToken;

    constructor(address _fzarToken, address _cusdToken) {
        fzarToken = IERC20(_fzarToken);
        cusdToken = IERC20(_cusdToken);
    }

    function addItem(
        string memory _name,
        string memory _imageURL,
        string memory _description,
        string memory _location,
        uint256 _price
    ) public {
        items[itemCount] = Item(
            msg.sender,
            _name,
            _imageURL,
            _description,
            _location,
            _price,
            false
        );
        itemCount++;
    }

    function buyItem(uint256 _itemId, address _token) public {
    Item storage item = items[_itemId];
    require(!item.sold, "Item is already sold");

    console.log("Buying Item:", _itemId);
    console.log("Item Name:", item.name);
    console.log("Item Price:", item.price);
    console.log("Item Sold:", item.sold);
    console.log("Buyer:", msg.sender);
    console.log("Token Address:", _token);

    try {
        if (_token == address(fzarToken)) {
            require(
                fzarToken.transferFrom(msg.sender, item.owner, item.price),
                "Token transfer failed"
            );
        } else if (_token == address(cusdToken)) {
            require(
                cusdToken.transferFrom(msg.sender, item.owner, item.price),
                "Token transfer failed"
            );
        } else {
            revert("Invalid token address");
        }
    } catch Error(string memory reason) {
        console.log("Error: ", reason);
        revert(reason);
    }

    item.sold = true;
    item.owner = msg.sender;
    boughtItems[msg.sender].push(_itemId);
    soldItems[item.owner].push(_itemId);
}

    function getBoughtItems(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return boughtItems[_user];
    }

    function getSoldItems(address _user) public view returns (uint256[] memory) {
        return soldItems[_user];
    }
}