import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { Box, Button, Divider, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import Item from "../../MuiExtensions/Item";
import wrapAPICall from "../../GlobalState/LoadingState/wrapAPICall";
import { LoadingContext } from "../../GlobalState/LoadingState/LoadingStore";

const CardPanel = (props: any) => {
  const [loadingState, setLoadingState]: any = useContext(LoadingContext);

  const [bank, setBank] = useState<any>({});
  const [banks, setBanks] = useState<any[]>([]);

  const [card, setCard] = useState<any>({});
  const [cards, setCards] = useState<any[]>([]);

  const [category, setCategory] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  const [codes, setCodes] = useState<string>("");

  const [dashboardData, setDashboardData] = useState<any>({});

  useEffect(() => {
    wrapAPICall(loadBanksData, setLoadingState);
  }, [])

  const loadBanksData = async () => {
    const response = await fetch("api/v1/Bank/GetAllBanks", {
      method: "GET",
    });

    const result = await response.json();

    switch (response.status) {
      case 200:
        setBanks(result);
        UpdateData((x: any) => x.id == bank.id)
      case 400:
      default:
    }
  }

  const UpdateData = (bankPredicate: any) => {
    setBank({});
    setCard({});
    setCategory({});
    setDashboardData({});
    setCategories([]);
    setCodes("");

    let selectedBank = banks.find(bankPredicate)

    console.log("selectedBank");
    console.log(selectedBank);

    if (selectedBank) {
      setBank(selectedBank);
      setCards(selectedBank.discountCards)
    };
  }

  //--- Bank region ---
  const handleCreateBank = async (event: React.FormEvent<HTMLFormElement>) => {
    wrapAPICall(async () => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const requestData = {
        Name: data.get("bankname"),
      };

      const response = await fetch("api/v1/Bank/CreateBank", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      switch (response.status) {
        case 200:
          setBanks([...banks, result])
          break;
        case 400:
        default:
      }
    }, setLoadingState);
  };

  const handleSelectBank = (event: SelectChangeEvent) => {
    UpdateData((x: any) => x.id == event.target.value)
  };
  //------------

  //--- Card region ---
  const handleCreateCard = async (event: React.FormEvent<HTMLFormElement>) => {
    wrapAPICall(async () => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const requestData = {
        Name: data.get("cardname"),
        Conditions: data.get("conditions"),
        BankId: bank.id,
      };

      const response = await fetch("api/v1/DiscountCard/CreateDiscountCard", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      switch (response.status) {
        case 200:
          setCards([...cards, result])
          break;
        case 400:
        default:
      }
    }, setLoadingState);
  };

  const handleSelectCard = (event: SelectChangeEvent) => {
    let selectedCard = cards.find(x => x.id == event.target.value)

    console.log("selectedCard")
    console.log(selectedCard)

    setCard(selectedCard);
    setCategories(selectedCard.categories);
  };
  //------------


  //--- Category region ---
  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    wrapAPICall(async () => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const requestData = {
        Name: data.get("categoryname"),
        DiscountCardId: card.id,
      };

      const response = await fetch("api/v1/Category/CreateCategory", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("category result")
      console.log(result)

      switch (response.status) {
        case 200:
          setCategories([...categories, result])
          console.log(categories)
          break;
        case 400:
        default:
      }
    }, setLoadingState);
  };

  const handleSelectCategory = (event: SelectChangeEvent) => {
    let selectedCategory = categories.find(x => x.id == event.target.value)

    console.log("selectedCategory");
    console.log(selectedCategory);

    setCategory(selectedCategory);
    setCodes(FormatCodes(selectedCategory.mccCodes));
    renderDashboard(selectedCategory.id);
  };
  //------------


  //--- Codes region ---

  const handleReplaceCodes = async (event: React.FormEvent<HTMLFormElement>) => {
    wrapAPICall(async () => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);

      const requestData = {
        Codes: data.get("codes")?.toString(),
        CategoryId: category.id,
      };

      const response = await fetch("api/v1/Category/ReplaceCodes", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      switch (response.status) {
        case 200:
          setCodes(result.codes)
          break;
        case 400:
        default:
      }
    }, setLoadingState);
  };

  //------------

  //--- Dashboard region

  const renderDashboard = (categoryId: string) => {
    if (category) {
      wrapAPICall(async () => {

        const response = await fetch("api/v1/Dashboard/GetDashboardByCategoryId?CategoryId=" + categoryId, {
          method: "GET"
        });

        const result = await response.json();

        console.log("Data for dashboard rendering")
        console.log(result)

        switch (response.status) {
          case 200:
            setDashboardData(result)
            break;
          case 400:
          default:
        }
      }, setLoadingState);
    }
  }

  const textForDashboard = () => {
    console.log("start render dashboard")

    let result = commercialNetworkSeporator;

    if (dashboardData.stores) {
      [...dashboardData.stores].forEach((store: any) => {
        result += `${store.name}\n${storeNetworkSeporator}`;
        [...store.stores].forEach((storePoint: any) => {
          result += `[${storePoint.address || "?????????? ???? ????????????"}] - ${storePoint.mccCode.code}\n${storeSeporator}`;
        })
        result += commercialNetworkSeporator;
      })
    }

    console.log("end render dashboard")
    console.log(result)

    return result;
  }

  const commercialNetworkSeporator = "-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n"
  const storeNetworkSeporator = "-----                                         -----\n"
  const storeSeporator = "---------------------------------------------\n"

  //------------

  //--- Helpers region ---

  const FormatCodes = (codeItems: any[]) => {
    if (!codeItems) return "";

    return codeItems.map((c: any) => c.code).join(", ");
  }

  //------------

  return (
    <Item>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'repeat(12, 1fr)',
        }}
      >
        <Box className="bankPanel" gridColumn="span 3">
          <InputLabel id="demo-simple-select-label">??????????</InputLabel>
          <Select
            value={bank?.name}
            fullWidth
            label="???????????????? ??????????"
            onChange={handleSelectBank}
          >
            {
              banks?.map((bank: any) => {
                return (
                  <MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>
                );
              })}
          </Select>
          <Box
            className="createPanel"
            sx={{ mt: 1 }}
          >
            <Divider />
            <InputLabel>?????????????? ????????</InputLabel>
            <Box
              component="form"
              onSubmit={handleCreateBank}
              sx={{ mt: 1 }}>
              <TextField
                name="bankname"
                autoComplete="bankname"
                label="???????????????? ??????????"
                margin="normal"
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loadingState.Loading}>
                ??????????????
              </Button>
            </Box>
          </Box>
        </Box>

        <Box className="cardPanel" gridColumn="span 3">
          <InputLabel>???????????????????? ??????????</InputLabel>
          <Select
            value={card?.name}
            label="??????????"
            fullWidth
            onChange={handleSelectCard}
          >
            {
              cards?.map((card: any) => {
                return (
                  <MenuItem key={card.id} value={card.id}>{card.name}</MenuItem>
                );
              })}
          </Select>
          <TextField
            name="conditions"
            autoComplete="conditions"
            label="???????????????????? (??????????????)"
            fullWidth
            multiline
            value={card?.conditions || ""}
            inputProps={{ readOnly: true, }}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <Box
            className="createPanel"
            sx={{ mt: 1 }}>
            <Divider />
            <InputLabel>?????????????? ??????????</InputLabel>
            <Box
              component="form"
              onSubmit={handleCreateCard}
              sx={{ mt: 1 }}>
              <TextField
                name="cardname"
                autoComplete="cardname"
                label="???????????????? ??????????"
                margin="normal"
                fullWidth
                required
              />
              <TextField
                name="conditions"
                autoComplete="conditions"
                label="???????????????????? (??????????????)"
                margin="normal"
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loadingState.Loading}>
                ??????????????
              </Button>
            </Box>
          </Box>
        </Box>

        <Box className="categoryPanel" gridColumn="span 3">
          <InputLabel id="demo-simple-select-label">??????????????????</InputLabel>
          <Select
            value={category?.name}
            fullWidth
            label="???????????????? ??????????????????"
            onChange={handleSelectCategory}
          >
            {
              categories?.map((category: any) => {
                return (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                );
              })}
          </Select>
          <Box
            className="createPanel"
            sx={{ mt: 1 }}
          >
            <Divider />
            <InputLabel>?????????????? ??????????????????</InputLabel>
            <Box
              component="form"
              onSubmit={handleCreateCategory}
              sx={{ mt: 1 }}>
              <TextField
                name="categoryname"
                autoComplete="categoryname"
                label="???????????????? ??????????????????"
                margin="normal"
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loadingState.Loading}>
                ??????????????
              </Button>
            </Box>
          </Box>
        </Box>

        <Box className="categoryCodesPanel" gridColumn="span 3">
          <InputLabel>MCC ????????</InputLabel>
          <TextField
            name="codes"
            label="????????"
            fullWidth
            multiline
            value={codes}
            inputProps={{ readOnly: true, }}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <Box
            className="createPanel"
            sx={{ mt: 1 }}>
            <Divider />
            <InputLabel>???????????????? ????????</InputLabel>
            <Box
              component="form"
              onSubmit={handleReplaceCodes}
              sx={{ mt: 1 }}>
              <TextField
                name="codes"
                label="?????????? ????????"
                margin="normal"
                multiline
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loadingState.Loading}>
                ????????????????
              </Button>
            </Box>
          </Box>
        </Box>

        {
          dashboardData.stores ?
            <Box className="dashboardPanel" gridColumn="span 12">
              <InputLabel>???????????????????? ????????????????</InputLabel>
              <TextField
                fullWidth
                multiline
                value={textForDashboard() || ""}
                inputProps={{ readOnly: true, }}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Box>
            : null
        }
      </Box>
    </Item>
  );
};

export default CardPanel;
