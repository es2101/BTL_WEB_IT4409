import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EthPayment from '../../components/Payment/EthPayment';
import './Payment.css';
import VietQRPayment from '../../components/Payment/VietQRPayment';
import { useCart } from '../../context/CartContext';
import { useOrderService } from '../../services/useOrderService';
import SepayPayment from '../../components/Payment/SepayPayment';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderData, paymentMethod: initialMethod } = location.state || {};
    const [paymentMethod, setPaymentMethod] = useState(initialMethod || '');
    const [showMetaMaskPopup, setShowMetaMaskPopup] = useState(false);

    const { clearCart } = useCart();
    const { confirmPayment } = useOrderService();

    useEffect(() => {
        if (!orderData) {
            alert("Không tìm thấy thông tin đơn hàng. Vui lòng đặt hàng lại.");
            navigate('/cart');
        }
    }, [orderData, navigate]);

    useEffect(() => {
        if (paymentMethod === 'ETH') {
            if (typeof window.ethereum === 'undefined') {
                setShowMetaMaskPopup(true);
            }
        }
    }, [paymentMethod]);


    const handleMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleFinishCOD = () => {
        alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
        navigate('/my-orders');
    };


    const handleEthSuccess = async (txHash) => {
        try {
            await confirmPayment(orderData._id || orderData.id);
            await clearCart();
            alert(`Thanh toán ETH thành công!\nCảm ơn bạn đã mua sắm.\nMã giao dịch: ${txHash}`);
            navigate('/my-orders');
        } catch (err) {
            console.error(err);
            alert("Thanh toán thành công nhưng có lỗi khi cập nhật trạng thái. Vui lòng kiểm tra lại đơn hàng.");
            navigate('/my-orders');
        }
    };

    const handleVietQRSuccess = async () => {
        try {
            await confirmPayment(orderData._id || orderData.id);
            await clearCart();
            alert("Xác nhận thanh toán VietQR thành công!");
            navigate('/my-orders');
        } catch (err) {
            console.error(err);
            alert("Thanh toán thành công nhưng có lỗi khi cập nhật trạng thái. Vui lòng kiểm tra lại đơn hàng.");
            navigate('/my-orders');
        }
    }

    const handleSepaySuccess = () => {
        try {
            confirmPayment(orderData._id || orderData.id);
            clearCart();
            alert("Thanh toán SePay thành công! Cảm ơn bạn đã mua sắm.");
            navigate('/my-orders');
        } catch (err) {
            console.error(err);
            alert("Thanh toán thành công nhưng có lỗi khi cập nhật trạng thái. Vui lòng kiểm tra lại đơn hàng.");
            navigate('/my-orders');
        }
    }

    if (!orderData) return <div className="p-8 text-center">Đang tải thông tin...</div>;


    const totalAmount = orderData.totalAmount || orderData.total || 0;
    const orderId = orderData._id || orderData.id;

    return (
        <div className="checkout-container">
            <div className="payment-layout">
                {/* Left Column: Title + Chart */}
                <div className="payment-left-column">
                    <h1 className="checkout-title">Thanh toán đơn hàng</h1>
                    <div className="crypto-widget-container">
                        <iframe
                            title="ETH Chart"
                            src="https://www.tradingview.com/widgetembed/?symbol=BINANCE:ETHUSDT&interval=15&theme=dark"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allowTransparency="true"
                            scrolling="no"
                        ></iframe>
                    </div>
                </div>

                {/* Payment Interface (Main Content) */}
                <div className="payment-section">
                    <h3 className="payment-title">Chọn phương thức thanh toán:</h3>
                    <div className="payment-options">

                        {/* COD Option */}
                        <label className={`payment-option-label ${paymentMethod === 'COD' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={handleMethodChange}
                            />
                            <div className="option-content">
                                <span className="option-name">Thanh toán khi nhận hàng (COD)</span>
                                <span className="option-desc">Thanh toán tiền mặt khi giao hàng</span>
                            </div>
                        </label>

                        {/* SePay Option */}
                        <label className={`payment-option-label ${paymentMethod === 'SePay' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="SePay"
                                checked={paymentMethod === 'SePay'}
                                onChange={handleMethodChange}
                            />
                            <div className="option-content">
                                <span className="option-name">Chuyển khoản ngân hàng (SePay)</span>
                                <span className="option-desc">Tự động xác nhận thanh toán</span>
                            </div>
                        </label>

                        {/* VietQR Option */}
                        <label className={`payment-option-label ${paymentMethod === 'VietQR' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="VietQR"
                                checked={paymentMethod === 'VietQR'}
                                onChange={handleMethodChange}
                            />
                            <div className="option-content">
                                <span className="option-name">Chuyển khoản ngân hàng (VietQR)</span>
                                <span className="option-desc">Quét mã QR để thanh toán nhanh</span>
                            </div>
                        </label>

                        {/* ETH Option */}
                        <label className={`payment-option-label ${paymentMethod === 'ETH' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="ETH"
                                checked={paymentMethod === 'ETH'}
                                onChange={handleMethodChange}
                            />
                            <div className="option-content">
                                <span className="option-name">Thanh toán bằng tiền điện tử (ETH)</span>
                                <span className="option-desc">Thanh toán an toàn qua ví MetaMask</span>
                            </div>
                        </label>
                    </div>

                    {/* Conditional Rendering Areas */}
                    {paymentMethod === 'COD' && (
                        <div className="payment-content fade-in">
                            <p className="mb-4">Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.</p>
                            <button onClick={handleFinishCOD} className="btn-finish">Hoàn thành đơn hàng</button>
                        </div>
                    )}

                    {paymentMethod === 'SePay' && (
                        <div className="payment-content fade-in">
                            <SepayPayment
                                orderId={orderId}
                                totalAmount={totalAmount}
                                onPaymentSuccess={handleSepaySuccess}
                            />
                        </div>
                    )}

                    {paymentMethod === 'VietQR' && (
                        <div className="payment-content fade-in">
                            <VietQRPayment
                                orderId={orderId}
                                totalAmount={totalAmount}
                                onPaymentSuccess={handleVietQRSuccess}
                            />
                        </div>
                    )}

                    {paymentMethod === 'ETH' && typeof window.ethereum !== 'undefined' && (
                        <div className="payment-content fade-in">
                            <EthPayment
                                orderId={orderId}
                                amountVND={totalAmount}
                                onSuccess={handleEthSuccess}
                            />
                        </div>
                    )}

                    {/* xử lý nếu ví metamask lỗi */}
                    {paymentMethod === 'ETH' && typeof window.ethereum === 'undefined' && (
                        <p className="text-red-500 mt-4">Vui lòng cài đặt MetaMask để tiếp tục.</p>
                    )}
                </div>

                {/* Order Information Summary (Sidebar) */}
                <div className="order-info-sidebar">
                    <div className="order-info-card">
                        <h2>Tóm tắt đơn hàng</h2>
                        <p className="order-id">Mã đơn: #{orderId.slice(-6).toUpperCase()}</p>

                        <div className="order-items-list">
                            {orderData.items && orderData.items.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-details">
                                        <span className="item-quantity">{item.quantity}x</span>
                                        <span className="item-name">{item.product?.name || item.name}</span>
                                    </div>
                                    <span className="item-price">{(item.price || 0).toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-total-section">
                            <div className="row">
                                <span>Tạm tính</span>
                                <span>{totalAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="row">
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className="divider"></div>
                            <div className="row total">
                                <span>Tổng cộng</span>
                                <span className="total-amount">{totalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* popup khi thieu metamask */}
            {showMetaMaskPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="text-4xl mb-4">🦊</div>
                        <h3 className="modal-title">Vui lòng cài đặt Metamask</h3>
                        <div className="mt-4">
                            <button
                                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                onClick={() => setShowMetaMaskPopup(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div> /* <--- [THÊM] Đóng checkout-container */
    );
};

export default Payment;